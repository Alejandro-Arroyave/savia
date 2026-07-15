import { i18n } from "../i18n";

// Los escalares Date/DateTime del servidor llegan como strings ISO al cliente.
// Estas utilidades los parsean y formatean en el locale activo.

export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Parsea una fecha "solo día" ("YYYY-MM-DD") como fecha LOCAL, no UTC.
 * Evita el clásico desfase de un día al ubicar eventos en el calendario.
 */
export function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return parseDate(value);
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

/** "YYYY-MM-DD" a partir de los componentes locales de la fecha. */
export function toISODateLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Fecha corta tipo "9 jul". */
export function formatShortDate(value: string | Date | null | undefined): string {
  const date = value instanceof Date ? value : parseDate(value ?? null);
  if (!date) return "—";
  return new Intl.DateTimeFormat(i18n.locale, { day: "numeric", month: "short" }).format(date);
}

/** "YYYY-MM-DD" para enviar al servidor (escalar Date). */
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayISODate(): string {
  return toISODate(new Date());
}
