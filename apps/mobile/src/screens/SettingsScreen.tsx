import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useMutation, useQuery } from "@apollo/client";
import type { Theme } from "../theme/ThemeProvider";
import { useTheme } from "../theme/ThemeProvider";
import { useThemedStyles } from "../theme/useThemedStyles";
import { useAuth } from "../auth/AuthContext";
import { t } from "../i18n";
import {
  ME_QUERY,
  UPDATE_NOTIFICATION_PREFS_MUTATION,
  type Me,
} from "../graphql/operations";
import { Screen } from "../components/Screen";
import { AppBar } from "../components/AppBar";
import { Card } from "../components/Card";
import { Icon, type IconName } from "../components/Icon";
import { LoadingView } from "../components/StateViews";

export function SettingsScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { email, signOut } = useAuth();
  const { data, loading } = useQuery<{ me: Me | null }>(ME_QUERY);
  const [updatePrefs] = useMutation(UPDATE_NOTIFICATION_PREFS_MUTATION);

  const me = data?.me;

  function setPref(pref: Partial<Pick<Me, "notifyHour" | "notifyDayBefore" | "notifyDayOf">>) {
    updatePrefs({ variables: pref }).catch(() => {
      /* el error se refleja al no cambiar el estado en caché */
    });
  }

  const displayName = me?.name ?? email ?? "";
  const initial = displayName.charAt(0).toUpperCase() || "?";
  const hourLabel = me ? `${String(me.notifyHour).padStart(2, "0")}:00` : "—";

  return (
    <Screen>
      <AppBar title={t("settings.title")} />
      {loading && !me ? (
        <LoadingView />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.account}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.name}>{displayName}</Text>
              {me?.email ? <Text style={styles.email}>{me.email}</Text> : null}
            </View>
          </Card>

          <Text style={styles.groupLabel}>{t("settings.account")}</Text>
          <Card padded={false}>
            <Row icon="user" title={t("settings.username")} subtitle={displayName} right="chevron" />
            <Row icon="lock" title={t("settings.changePassword")} right="chevron" />
            <Row
              icon="globe"
              title={t("settings.language")}
              subtitle={t("settings.languageValue")}
              right="chevron"
              last
            />
          </Card>

          <Text style={styles.groupLabel}>{t("settings.notifications")}</Text>
          <Card padded={false}>
            <Row
              icon="clock"
              title={t("settings.notifyHour")}
              subtitle={t("settings.notifyHourHint")}
              right={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("settings.notifyHour")}
                  onPress={() => me && setPref({ notifyHour: (me.notifyHour + 1) % 24 })}
                  style={styles.timePill}
                >
                  <Text style={styles.timePillText}>{hourLabel}</Text>
                </Pressable>
              }
            />
            <Row
              icon="bell"
              title={t("settings.notifyDayBefore")}
              subtitle={t("settings.notifyDayBeforeHint")}
              right={
                <Switch
                  value={me?.notifyDayBefore ?? false}
                  onValueChange={(v) => setPref({ notifyDayBefore: v })}
                  trackColor={{ true: colors.primary, false: colors.lineStrong }}
                />
              }
            />
            <Row
              icon="check"
              title={t("settings.notifyDayOf")}
              subtitle={t("settings.notifyDayOfHint")}
              last
              right={
                <Switch
                  value={me?.notifyDayOf ?? false}
                  onValueChange={(v) => setPref({ notifyDayOf: v })}
                  trackColor={{ true: colors.primary, false: colors.lineStrong }}
                />
              }
            />
          </Card>

          <Card style={styles.signOutCard} padded={false}>
            <Pressable
              accessibilityRole="button"
              onPress={signOut}
              style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
            >
              <Icon name="log-out" size={18} color={colors.danger} />
              <Text style={styles.signOutText}>{t("auth.signOut")}</Text>
            </Pressable>
          </Card>
        </ScrollView>
      )}
    </Screen>
  );
}

interface RowProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  right?: "chevron" | React.ReactNode;
  last?: boolean;
}

function Row({ icon, title, subtitle, right, last = false }: RowProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowIcon}>
        <Icon name={icon} size={17} color={colors.ink2} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {right === "chevron" ? (
        <Icon name="chevron-right" size={17} color={colors.inkSoft} />
      ) : (
        right
      )}
    </View>
  );
}

const makeStyles = (t2: Theme) =>
  StyleSheet.create({
    flex: { flex: 1, minWidth: 0 },
    content: { padding: t2.spacing.lg },
    account: { flexDirection: "row", alignItems: "center", gap: 13, marginBottom: t2.spacing.xs },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: t2.colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { color: t2.colors.onPrimary, fontWeight: "800", fontSize: 19 },
    name: { fontWeight: "700", fontSize: 15, color: t2.colors.ink },
    email: { fontSize: 12.5, color: t2.colors.inkSoft },
    groupLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
      color: t2.colors.inkSoft,
      marginTop: t2.spacing.lg,
      marginBottom: t2.spacing.sm,
      marginHorizontal: t2.spacing.xs,
    },
    row: { flexDirection: "row", alignItems: "center", gap: t2.spacing.md, padding: 13 },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: t2.colors.line },
    rowIcon: {
      width: 32,
      height: 32,
      borderRadius: t2.radius.sm,
      backgroundColor: t2.colors.surface2,
      alignItems: "center",
      justifyContent: "center",
    },
    rowTitle: { fontSize: 13.5, fontWeight: "600", color: t2.colors.ink },
    rowSubtitle: { fontSize: 12, color: t2.colors.inkSoft },
    timePill: {
      backgroundColor: t2.colors.surface2,
      borderWidth: 1,
      borderColor: t2.colors.line,
      borderRadius: t2.radius.sm,
      paddingHorizontal: 11,
      paddingVertical: 6,
    },
    timePillText: {
      fontWeight: "800",
      fontSize: 14,
      color: t2.colors.ink,
      fontVariant: ["tabular-nums"],
    },
    signOutCard: { marginTop: t2.spacing.lg },
    signOut: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: t2.spacing.sm,
      padding: 14,
    },
    pressed: { opacity: 0.6 },
    signOutText: { color: t2.colors.danger, fontWeight: "700", fontSize: 14 },
  });
