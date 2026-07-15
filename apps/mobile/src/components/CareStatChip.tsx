import { StyleSheet, Text, View } from "react-native";
import type { CareType } from "@savia/shared";
import type { Theme } from "../theme/ThemeProvider";
import { useTheme } from "../theme/ThemeProvider";
import { useThemedStyles } from "../theme/useThemedStyles";
import { careAccent, careIcon, careLabel, type CareStatusView } from "../domain/care";
import { Icon } from "./Icon";

interface CareStatChipProps {
  type: CareType;
  status: CareStatusView;
}

/** Fila inline: ícono + etiqueta a la izquierda, valor a la derecha (a todo el ancho). */
export function CareStatChip({ type, status }: CareStatChipProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const accent = careAccent(type, colors);

  const valueColor =
    status.tone === "overdue" ? colors.danger : status.tone === "due" ? accent.fg : colors.ink;

  return (
    <View style={[styles.row, status.tone === "overdue" && styles.overdueRow]}>
      <View style={[styles.iconBox, { backgroundColor: accent.bg }]}>
        <Icon name={careIcon(type)} size={14} color={accent.fg} />
      </View>
      <Text style={styles.label}>{careLabel(type)}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{status.label}</Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing.sm,
      backgroundColor: t.colors.surface2,
      borderWidth: 1,
      borderColor: t.colors.line,
      borderRadius: 11,
      paddingHorizontal: 11,
      paddingVertical: t.spacing.sm,
    },
    overdueRow: {
      backgroundColor: t.colors.dangerBg,
      borderColor: "transparent",
    },
    iconBox: {
      width: 24,
      height: 24,
      borderRadius: 7,
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      flex: 1,
      color: t.colors.inkSoft,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      fontWeight: "600",
    },
    value: {
      fontSize: 13,
      fontWeight: "700",
      fontVariant: ["tabular-nums"],
    },
  });
