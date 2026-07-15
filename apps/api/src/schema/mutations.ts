import { GraphQLError } from "graphql";
import { computeNextDue } from "@savia/shared";
import { builder } from "../builder.js";
import { requireUser } from "./auth.js";
import { CareTypeEnum } from "./enums.js";
import "./types.js";

// Input para un tipo de cuidado al crear la planta (riego / abono).
const CareInput = builder.inputType("CareInput", {
  fields: (t) => ({
    type: t.field({ type: CareTypeEnum, required: true }),
    intervalDays: t.int({ required: true }),
    lastDoneAt: t.field({ type: "Date", required: true }),
  }),
});

builder.mutationFields((t) => ({
  // Registrar planta + sus horarios de cuidado (crea los CareSchedule con nextDueAt).
  addPlant: t.prismaField({
    type: "Plant",
    args: {
      name: t.arg.string({ required: true }),
      species: t.arg.string(),
      photoUrl: t.arg.string(),
      care: t.arg({ type: [CareInput], required: true }),
    },
    resolve: (query, _root, args, ctx) => {
      const user = requireUser(ctx);
      return ctx.prisma.plant.create({
        ...query,
        data: {
          userId: user.id,
          name: args.name,
          species: args.species ?? null,
          photoUrl: args.photoUrl ?? null,
          schedules: {
            create: args.care.map((c) => ({
              type: c.type,
              intervalDays: c.intervalDays,
              lastDoneAt: c.lastDoneAt,
              nextDueAt: computeNextDue(c.lastDoneAt, c.intervalDays),
            })),
          },
        },
      });
    },
  }),

  // Registrar riego/abono: crea el evento y adelanta el horario.
  logCare: t.prismaField({
    type: "CareSchedule",
    args: {
      plantId: t.arg.id({ required: true }),
      type: t.arg({ type: CareTypeEnum, required: true }),
      doneAt: t.arg({ type: "Date" }),
    },
    resolve: async (query, _root, args, ctx) => {
      const user = requireUser(ctx);
      const plantId = String(args.plantId);

      const plant = await ctx.prisma.plant.findFirst({
        where: { id: plantId, userId: user.id },
        include: { schedules: { where: { type: args.type } } },
      });
      const schedule = plant?.schedules[0];
      if (!plant || !schedule) {
        throw new GraphQLError("Planta o tipo de cuidado no encontrado", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      const doneAt = args.doneAt ?? new Date();

      await ctx.prisma.careEvent.create({
        data: { plantId, type: args.type, doneAt },
      });

      return ctx.prisma.careSchedule.update({
        ...query,
        where: { id: schedule.id },
        data: { lastDoneAt: doneAt, nextDueAt: computeNextDue(doneAt, schedule.intervalDays) },
      });
    },
  }),

  // Preferencias de notificación (hora, día antes, mismo día, zona horaria).
  updateNotificationPrefs: t.prismaField({
    type: "User",
    args: {
      notifyHour: t.arg.int(),
      notifyDayBefore: t.arg.boolean(),
      notifyDayOf: t.arg.boolean(),
      timezone: t.arg.string(),
    },
    resolve: (query, _root, args, ctx) => {
      const user = requireUser(ctx);
      return ctx.prisma.user.update({
        ...query,
        where: { id: user.id },
        data: {
          notifyHour: args.notifyHour ?? undefined,
          notifyDayBefore: args.notifyDayBefore ?? undefined,
          notifyDayOf: args.notifyDayOf ?? undefined,
          timezone: args.timezone ?? undefined,
        },
      });
    },
  }),

  // Guardar el push token del dispositivo al iniciar sesión.
  registerPushToken: t.boolean({
    args: {
      token: t.arg.string({ required: true }),
      platform: t.arg.string(),
    },
    resolve: async (_root, args, ctx) => {
      const user = requireUser(ctx);
      await ctx.prisma.pushToken.upsert({
        where: { token: args.token },
        update: { userId: user.id, platform: args.platform ?? null, lastUsedAt: new Date() },
        create: {
          userId: user.id,
          token: args.token,
          platform: args.platform ?? null,
          lastUsedAt: new Date(),
        },
      });
      return true;
    },
  }),
}));
