import { builder } from "../builder.js";
import { CareTypeEnum } from "./enums.js";

// Objetos Prisma expuestos a GraphQL. El plugin de Pothos mapea relaciones y
// resuelve solo los campos pedidos (evita N+1 con `prismaField`).

export const UserType = builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    email: t.exposeString("email"),
    name: t.exposeString("name", { nullable: true }),
    locale: t.exposeString("locale"),
    timezone: t.exposeString("timezone"),
    notifyHour: t.exposeInt("notifyHour"),
    notifyDayBefore: t.exposeBoolean("notifyDayBefore"),
    notifyDayOf: t.exposeBoolean("notifyDayOf"),
    plants: t.relation("plants"),
  }),
});

export const PlantType = builder.prismaObject("Plant", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    species: t.exposeString("species", { nullable: true }),
    photoUrl: t.exposeString("photoUrl", { nullable: true }),
    schedules: t.relation("schedules"),
    events: t.relation("events"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
  }),
});

export const CareScheduleType = builder.prismaObject("CareSchedule", {
  fields: (t) => ({
    id: t.exposeID("id"),
    type: t.expose("type", { type: CareTypeEnum }),
    intervalDays: t.exposeInt("intervalDays"),
    lastDoneAt: t.expose("lastDoneAt", { type: "Date", nullable: true }),
    nextDueAt: t.expose("nextDueAt", { type: "Date", nullable: true }),
  }),
});

export const CareEventType = builder.prismaObject("CareEvent", {
  fields: (t) => ({
    id: t.exposeID("id"),
    type: t.expose("type", { type: CareTypeEnum }),
    doneAt: t.expose("doneAt", { type: "Date" }),
  }),
});
