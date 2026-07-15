import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { Theme } from "../theme/ThemeProvider";
import { useTheme } from "../theme/ThemeProvider";
import { useThemedStyles } from "../theme/useThemedStyles";
import { Icon, type IconName } from "./Icon";

type ButtonVariant = "primary" | "ghost" | "water" | "earth";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  loading = false,
  disabled = false,
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const isDisabled = disabled || loading;

  const bg: Record<ButtonVariant, string> = {
    primary: colors.primary,
    ghost: colors.surface,
    water: colors.water,
    earth: colors.earth,
  };
  const fg = variant === "primary" ? colors.onPrimary : variant === "ghost" ? colors.ink : "#FFFFFF";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg[variant] },
        variant === "ghost" && styles.ghostBorder,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={18} color={fg} /> : null}
          <Text style={[styles.label, { color: fg }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    base: {
      borderRadius: t.radius.md,
      paddingVertical: 13,
      paddingHorizontal: t.spacing.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    ghostBorder: {
      borderWidth: 1,
      borderColor: t.colors.lineStrong,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing.sm,
    },
    label: {
      fontSize: 14.5,
      fontWeight: "700",
    },
    pressed: { opacity: 0.85 },
    disabled: { opacity: 0.5 },
  });
