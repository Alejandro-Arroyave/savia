// Conversión de "hora de pared en una zona IANA" → instante UTC, sin dependencias.
// Clave para calcular a qué instante real se debe enviar un aviso.

function getOffsetMs(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const map: Record<string, number> = {};
  for (const p of dtf.formatToParts(date)) {
    if (p.type !== "literal") map[p.type] = Number(p.value);
  }
  const asUTC = Date.UTC(map.year!, map.month! - 1, map.day!, map.hour!, map.minute!, map.second!);
  return asUTC - date.getTime();
}

/**
 * Instante UTC correspondiente a la hora local (`hour:00`) del día `dateOnly`
 * en la zona `timeZone`. Una sola pasada de ajuste de offset (suficiente para el MVP).
 */
export function zonedTimeToUtc(dateOnly: Date, hour: number, timeZone: string): Date {
  const y = dateOnly.getUTCFullYear();
  const m = dateOnly.getUTCMonth();
  const d = dateOnly.getUTCDate();
  const guess = Date.UTC(y, m, d, hour, 0, 0);
  const offset = getOffsetMs(timeZone, new Date(guess));
  return new Date(guess - offset);
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Resta N días a una fecha (solo día, UTC). */
export function subtractDays(date: Date, days: number): Date {
  return new Date(date.getTime() - days * MS_PER_DAY);
}
