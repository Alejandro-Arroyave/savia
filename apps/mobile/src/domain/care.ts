import { careStatus, type CareType } from "@savia/shared";
import { t } from "../i18n";
import type { Palette } from "../theme/colors";

export type CareTone = "neutral" | "due" | "overdue";

export interface CareStatusView {
  label: string;
  tone: CareTone;
}

/** Convierte una fecha de vencimiento en texto legible + tono, reutilizando la lógica de @savia/shared. */
export function careStatusView(nextDueAt: Date | null): CareStatusView {
  if (!nextDueAt) return { label: t("care.never"), tone: "neutral" };

  const status = careStatus(nextDueAt);
  switch (status.kind) {
    case "today":
      return { label: t("care.today"), tone: "due" };
    case "upcoming":
      return { label: t("care.inDays", { count: status.inDays }), tone: "neutral" };
    case "overdue":
      return { label: t("care.overdue", { count: status.byDays }), tone: "overdue" };
  }
}

/** Color del acento según el tipo de cuidado (los "dos ritmos"). */
export function careAccent(type: CareType, colors: Palette): { fg: string; bg: string } {
  return type === "WATERING"
    ? { fg: colors.water, bg: colors.waterBg }
    : { fg: colors.earth, bg: colors.earthBg };
}

/** Icono de Feather (@expo/vector-icons) por tipo de cuidado. */
export function careIcon(type: CareType): "droplet" | "feather" {
  return type === "WATERING" ? "droplet" : "feather";
}

export function careLabel(type: CareType): string {
  return type === "WATERING" ? t("care.watering") : t("care.fertilizing");
}
