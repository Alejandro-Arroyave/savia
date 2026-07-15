import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { Theme } from "../theme/ThemeProvider";
import { useTheme } from "../theme/ThemeProvider";
import { useThemedStyles } from "../theme/useThemedStyles";
import { t } from "../i18n";
import { Button } from "./Button";

export function LoadingView() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.center} accessibilityRole="progressbar">
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.muted}>{t("common.loading")}</Text>
    </View>
  );
}

export function ErrorView({ onRetry }: { onRetry?: () => void }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{t("common.errorTitle")}</Text>
      <Text style={styles.muted}>{t("common.errorBody")}</Text>
      {onRetry ? (
        <View style={styles.action}>
          <Button label={t("common.retry")} variant="ghost" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

export function EmptyView({ message, cta }: { message: string; cta?: React.ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.center}>
      <Text style={styles.muted}>{message}</Text>
      {cta ? <View style={styles.action}>{cta}</View> : null}
    </View>
  );
}

const makeStyles = (t2: Theme) =>
  StyleSheet.create({
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: t2.spacing.xl,
      gap: t2.spacing.sm,
    },
    title: { fontSize: 16, fontWeight: "700", color: t2.colors.ink },
    muted: { fontSize: 14, color: t2.colors.inkSoft, textAlign: "center" },
    action: { marginTop: t2.spacing.md, alignSelf: "stretch" },
  });
