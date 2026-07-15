import type { ExpoPushMessage } from "expo-server-sdk";
import { NotificationKind, NotificationStatus } from "@prisma/client";
import { prisma } from "../prisma.js";
import { sendPushMessages } from "./push.js";
import { subtractDays, zonedTimeToUtc } from "./time.js";

// Cuántos días hacia adelante materializar avisos (cubre el "día antes").
const HORIZON_DAYS = 3;

/**
 * Paso 1 — Materializar: crea filas Notification (DAY_BEFORE / DAY_OF) para los
 * cuidados que vencen dentro del horizonte, respetando las preferencias del usuario.
 * El @@unique([plantId,type,kind,dueDate]) garantiza idempotencia.
 */
export async function materializeNotifications(now: Date = new Date()): Promise<number> {
  const horizonEnd = new Date(now.getTime() + HORIZON_DAYS * 24 * 60 * 60 * 1000);

  const schedules = await prisma.careSchedule.findMany({
    where: { nextDueAt: { not: null, lte: horizonEnd } },
    include: { plant: { include: { user: true } } },
  });

  let created = 0;
  for (const s of schedules) {
    const dueDate = s.nextDueAt!;
    const { user } = s.plant;

    const wanted: { kind: NotificationKind; scheduledFor: Date }[] = [];
    if (user.notifyDayBefore) {
      wanted.push({
        kind: NotificationKind.DAY_BEFORE,
        scheduledFor: zonedTimeToUtc(subtractDays(dueDate, 1), user.notifyHour, user.timezone),
      });
    }
    if (user.notifyDayOf) {
      wanted.push({
        kind: NotificationKind.DAY_OF,
        scheduledFor: zonedTimeToUtc(dueDate, user.notifyHour, user.timezone),
      });
    }

    for (const w of wanted) {
      // No re-crear avisos cuyo instante de envío ya pasó hace rato.
      if (w.scheduledFor.getTime() < now.getTime() - 60 * 60 * 1000) continue;

      const result = await prisma.notification.upsert({
        where: {
          plantId_type_kind_dueDate: {
            plantId: s.plantId,
            type: s.type,
            kind: w.kind,
            dueDate,
          },
        },
        update: {}, // ya existe → no tocar (idempotente)
        create: {
          userId: user.id,
          plantId: s.plantId,
          type: s.type,
          kind: w.kind,
          dueDate,
          scheduledFor: w.scheduledFor,
          status: NotificationStatus.PENDING,
        },
        select: { createdAt: true, updatedAt: true },
      });
      if (result.createdAt.getTime() === result.updatedAt.getTime()) created += 1;
    }
  }
  return created;
}

/**
 * Paso 2 — Despachar: envía por Expo Push los avisos PENDING cuyo instante ya llegó
 * y los marca SENT (o FAILED). Solo esta parte llama a la red.
 */
export async function dispatchDueNotifications(now: Date = new Date()): Promise<number> {
  const due = await prisma.notification.findMany({
    where: { status: NotificationStatus.PENDING, scheduledFor: { lte: now } },
    include: { user: { include: { pushTokens: true } } },
    take: 500,
  });

  // Notification.plantId es una relación lógica (sin FK dura): resolvemos los
  // nombres de planta en una sola consulta y los indexamos por id.
  const plantIds = [...new Set(due.map((n) => n.plantId).filter((id): id is string => id != null))];
  const plants = await prisma.plant.findMany({
    where: { id: { in: plantIds } },
    select: { id: true, name: true },
  });
  const plantNames = new Map(plants.map((p) => [p.id, p.name]));

  let sent = 0;
  for (const n of due) {
    const tokens = n.user.pushTokens.map((p) => p.token);
    if (tokens.length === 0) {
      await prisma.notification.update({
        where: { id: n.id },
        data: { status: NotificationStatus.CANCELLED },
      });
      continue;
    }

    const care = n.type === "WATERING" ? "regar" : "abonar";
    const when = n.kind === NotificationKind.DAY_BEFORE ? "mañana toca" : "hoy toca";
    const plantName = (n.plantId != null ? plantNames.get(n.plantId) : null) ?? "tu planta";

    const messages: ExpoPushMessage[] = tokens.map((to) => ({
      to,
      sound: "default",
      title: "Savia 🌿",
      body: `${when} ${care} ${plantName}`,
      data: { notificationId: n.id, plantId: n.plantId, type: n.type, kind: n.kind },
    }));

    try {
      await sendPushMessages(messages);
      await prisma.notification.update({
        where: { id: n.id },
        data: { status: NotificationStatus.SENT, sentAt: new Date() },
      });
      sent += 1;
    } catch (err) {
      console.error(`[worker] fallo enviando notificación ${n.id}:`, err);
      await prisma.notification.update({
        where: { id: n.id },
        data: { status: NotificationStatus.FAILED },
      });
    }
  }
  return sent;
}

/** Un ciclo completo del worker: materializar + despachar. */
export async function runTick(now: Date = new Date()): Promise<void> {
  const created = await materializeNotifications(now);
  const sent = await dispatchDueNotifications(now);
  console.log(`[worker] tick ${now.toISOString()} — creados: ${created}, enviados: ${sent}`);
}
