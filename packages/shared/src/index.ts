// Contratos y lógica de dominio compartidos entre API, worker y app móvil.
// No debe depender de Prisma ni de React — solo TypeScript puro.

export const CARE_TYPES = ["WATERING", "FERTILIZING"] as const;
export type CareType = (typeof CARE_TYPES)[number];

export const NOTIFICATION_KINDS = ["DAY_BEFORE", "DAY_OF"] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export const NOTIFICATION_STATUSES = ["PENDING", "SENT", "FAILED", "CANCELLED"] as const;
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Fecha (solo día, en UTC) a partir de un instante. */
function toDateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** próxima fecha = última fecha + intervalo (en días). */
export function computeNextDue(lastDoneAt: Date, intervalDays: number): Date {
  const base = toDateOnly(lastDoneAt);
  return new Date(base.getTime() + intervalDays * MS_PER_DAY);
}

/** Días entre hoy y la fecha objetivo. Negativo = atrasado. */
export function daysUntil(target: Date, today: Date = new Date()): number {
  return Math.round((toDateOnly(target).getTime() - toDateOnly(today).getTime()) / MS_PER_DAY);
}

export type CareStatus =
  | { kind: "today" }
  | { kind: "upcoming"; inDays: number }
  | { kind: "overdue"; byDays: number };

/** Estado legible para la UI: "Hoy" / "en N días" / "Atrasado N días". */
export function careStatus(nextDueAt: Date, today: Date = new Date()): CareStatus {
  const diff = daysUntil(nextDueAt, today);
  if (diff === 0) return { kind: "today" };
  if (diff > 0) return { kind: "upcoming", inDays: diff };
  return { kind: "overdue", byDays: -diff };
}
