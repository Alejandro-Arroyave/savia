import { builder } from "../builder.js";
import { requireUser } from "./auth.js";
import "./types.js";

builder.queryFields((t) => ({
  // Usuario autenticado + sus preferencias.
  me: t.prismaField({
    type: "User",
    nullable: true,
    resolve: (query, _root, _args, ctx) => {
      const user = requireUser(ctx);
      return ctx.prisma.user.findUnique({ ...query, where: { id: user.id } });
    },
  }),

  // Todas las plantas del usuario (para "Mis plantas").
  myPlants: t.prismaField({
    type: ["Plant"],
    resolve: (query, _root, _args, ctx) => {
      const user = requireUser(ctx);
      return ctx.prisma.plant.findMany({
        ...query,
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
    },
  }),

  // Detalle de una planta (verifica pertenencia).
  plant: t.prismaField({
    type: "Plant",
    nullable: true,
    args: { id: t.arg.id({ required: true }) },
    resolve: (query, _root, args, ctx) => {
      const user = requireUser(ctx);
      return ctx.prisma.plant.findFirst({
        ...query,
        where: { id: String(args.id), userId: user.id },
      });
    },
  }),

  // Eventos de cuidado en un rango de fechas → alimenta el calendario global.
  calendarEvents: t.prismaField({
    type: ["CareEvent"],
    args: {
      from: t.arg({ type: "Date", required: true }),
      to: t.arg({ type: "Date", required: true }),
    },
    resolve: (query, _root, args, ctx) => {
      const user = requireUser(ctx);
      return ctx.prisma.careEvent.findMany({
        ...query,
        where: {
          plant: { userId: user.id },
          doneAt: { gte: args.from, lte: args.to },
        },
        orderBy: { doneAt: "asc" },
      });
    },
  }),
}));
