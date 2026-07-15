import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Theme } from "../theme/ThemeProvider";
import { useTheme } from "../theme/ThemeProvider";
import { useThemedStyles } from "../theme/useThemedStyles";
import { Icon, type IconName } from "./Icon";

interface AppBarAction {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
}

interface AppBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: AppBarAction;
}

export function AppBar({ title, subtitle, onBack, action }: AppBarProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.bar}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={onBack}
          style={styles.iconBtn}
        >
          <Icon name="chevron-left" size={22} color={colors.ink2} />
        </Pressable>
      ) : null}
      <View style={styles.titles}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action.accessibilityLabel}
          onPress={action.onPress}
          style={styles.iconBtn}
        >
          <Icon name={action.icon} size={19} color={colors.ink2} />
        </Pressable>
      ) : null}
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    bar: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing.md,
      paddingHorizontal: t.spacing.lg,
      paddingVertical: t.spacing.sm,
    },
    titles: { flex: 1, minWidth: 0 },
    title: {
      fontFamily: t.fontFamily.serif,
      fontSize: 24,
      fontWeight: "600",
      color: t.colors.ink,
    },
    subtitle: {
      fontSize: 12.5,
      color: t.colors.inkSoft,
      marginTop: 1,
    },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: t.radius.md,
      borderWidth: 1,
      borderColor: t.colors.line,
      backgroundColor: t.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
  });
