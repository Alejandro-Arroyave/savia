import type { CareType } from "@savia/shared";
import type { CareEvent, Plant } from "../graphql/operations";
import { parseDateOnly, toISODateLocal } from "./date";

export interface MonthInfo {
  year: number;
  month: number; // 0-11
  fromISO: string;
  toISO: string;
}

export interface DayCell {
  day: number | null; // null = celda de relleno
  isToday: boolean;
  water: boolean;
  earth: boolean;
}

export interface UpcomingTask {
  key: string;
  date: Date;
  plantId: string;
  plantName: string;
  type: CareType;
}

/** Rango [primer día, último día] del mes desplazado `offset` meses respecto a hoy. */
export function monthInfo(offset: number, today: Date = new Date()): MonthInfo {
  const base = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const year = base.getFullYear();
  const month = base.getMonth();
  const last = new Date(year, month + 1, 0);
  return { year, month, fromISO: toISODateLocal(base), toISO: toISODateLocal(last) };
}

/** Índice de día de la semana con lunes = 0. */
function mondayFirstWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/**
 * Construye la matriz de celdas del mes con puntos por tipo, agregando eventos
 * hechos y próximos vencimientos (los puntos son por tipo de evento, no por planta).
 */
export function buildMonthCells(
  info: MonthInfo,
  events: CareEvent[],
  plants: Plant[],
  today: Date = new Date(),
): DayCell[] {
  const daysInMonth = new Date(info.year, info.month + 1, 0).getDate();
  const water = new Set<number>();
  const earth = new Set<number>();

  const mark = (date: Date | null, type: CareType) => {
    if (!date || date.getFullYear() !== info.year || date.getMonth() !== info.month) return;
    (type === "WATERING" ? water : earth).add(date.getDate());
  };

  for (const ev of events) mark(parseDateOnly(ev.doneAt), ev.type);
  for (const plant of plants) {
    for (const schedule of plant.schedules) mark(parseDateOnly(schedule.nextDueAt), schedule.type);
  }

  const cells: DayCell[] = [];
  const lead = mondayFirstWeekday(new Date(info.year, info.month, 1));
  for (let i = 0; i < lead; i += 1) {
    cells.push({ day: null, isToday: false, water: false, earth: false });
  }
  const isCurrentMonth = today.getFullYear() === info.year && today.getMonth() === info.month;
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      isToday: isCurrentMonth && today.getDate() === day,
      water: water.has(day),
      earth: earth.has(day),
    });
  }
  return cells;
}

/** Conteo de eventos hechos del mes, por tipo. */
export function countByType(events: CareEvent[]): { waterings: number; fertilizings: number } {
  let waterings = 0;
  let fertilizings = 0;
  for (const ev of events) {
    if (ev.type === "WATERING") waterings += 1;
    else fertilizings += 1;
  }
  return { waterings, fertilizings };
}

/** Próximas tareas (agenda continua): vencimientos desde hoy en adelante, ordenados. */
export function buildUpcoming(plants: Plant[], limit = 30, today: Date = new Date()): UpcomingTask[] {
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const tasks: UpcomingTask[] = [];
  for (const plant of plants) {
    for (const schedule of plant.schedules) {
      const date = parseDateOnly(schedule.nextDueAt);
      if (!date || date < todayStart) continue;
      tasks.push({
        key: `${plant.id}-${schedule.type}`,
        date,
        plantId: plant.id,
        plantName: plant.name,
        type: schedule.type,
      });
    }
  }
  tasks.sort((a, b) => a.date.getTime() - b.date.getTime());
  return tasks.slice(0, limit);
}
