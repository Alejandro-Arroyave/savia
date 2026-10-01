import { StyleSheet, View } from "react-native";
import type { CareType } from "@savia/shared";
import { useTheme } from "../theme/ThemeProvider";
import { careAccent, careIcon } from "../domain/care";
import { Icon } from "./Icon";

interface CareIconBadgeProps {
  type: CareType;
  size: number;
  iconSize: number;
  radius?: number;
}

/** Caja de ícono tintada según el tipo de cuidado (riego/abono) - un solo lugar para el patrón repetido en chip, tiles, filas y stats. */
export function CareIconBadge({ type, size, iconSize, radius }: CareIconBadgeProps) {
  const { colors } = useTheme();
  const accent = careAccent(type, colors);
  return (
    <View
      style={[
        styles.box,
        { width: size, height: size, borderRadius: radius ?? size * 0.28, backgroundColor: accent.bg },
      ]}
    >
      <Icon name={careIcon(type)} size={iconSize} color={accent.fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: "center", justifyContent: "center" },
});
