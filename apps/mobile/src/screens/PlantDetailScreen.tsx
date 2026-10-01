import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery } from "@apollo/client";
import type { CareType } from "@savia/shared";
import type { Theme } from "../theme/ThemeProvider";
import { useTheme } from "../theme/ThemeProvider";
import { useThemedStyles } from "../theme/useThemedStyles";
import { t } from "../i18n";
import { careAccent, careLabel, careStatusView } from "../domain/care";
import { formatShortDate, parseDate } from "../domain/date";
import {
  LOG_CARE_MUTATION,
  MY_PLANTS_QUERY,
  PLANT_QUERY,
  type CareSchedule,
  type PlantDetail,
} from "../graphql/operations";
import { Screen } from "../components/Screen";
import { AppBar } from "../components/AppBar";
import { Card } from "../components/Card";
import { CareIconBadge } from "../components/CareIconBadge";
import { Button } from "../components/Button";
import { LoadingView, ErrorView } from "../components/StateViews";
import type { RootStackScreenProps } from "../navigation/types";

export function PlantDetailScreen({ navigation, route }: RootStackScreenProps<"PlantDetail">) {
  const { plantId } = route.params;
  const styles = useThemedStyles(makeStyles);

  const { data, loading, error, refetch } = useQuery<{ plant: PlantDetail | null }>(PLANT_QUERY, {
    variables: { id: plantId },
  });

  const [logCare, { loading: logging }] = useMutation(LOG_CARE_MUTATION, {
    refetchQueries: [
      { query: PLANT_QUERY, variables: { id: plantId } },
      { query: MY_PLANTS_QUERY },
    ],
  });

  const handleLog = useCallback(
    (type: CareType) => logCare({ variables: { plantId, type } }),
    [logCare, plantId],
  );

  const plant = data?.plant ?? null;
  const watering = plant?.schedules.find((s) => s.type === "WATERING") ?? null;
  const fertilizing = plant?.schedules.find((s) => s.type === "FERTILIZING") ?? null;

  return (
    <Screen>
      <AppBar title={plant?.name ?? ""} subtitle={plant?.species ?? undefined} onBack={navigation.goBack} />
      {loading && !plant ? (
        <LoadingView />
      ) : error || !plant ? (
        <ErrorView onRetry={() => refetch()} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.stats}>
            {watering ? <BigStat type="WATERING" schedule={watering} /> : null}
            {fertilizing ? <BigStat type="FERTILIZING" schedule={fertilizing} /> : null}
          </View>

          <View style={styles.actions}>
            <View style={styles.actionButton}>
              <Button
                label={t("detail.logWatering")}
                icon="droplet"
                variant="water"
                loading={logging}
                onPress={() => handleLog("WATERING")}
              />
            </View>
            <View style={styles.actionButton}>
              <Button
                label={t("detail.logFertilizing")}
                icon="feather"
                variant="earth"
                loading={logging}
                onPress={() => handleLog("FERTILIZING")}
              />
            </View>
          </View>

          <Card padded={false}>
            {watering ? (
              <FrequencyRow type="WATERING" label={t("detail.wateringFreq")} schedule={watering} />
            ) : null}
            {fertilizing ? (
              <FrequencyRow
                type="FERTILIZING"
                label={t("detail.fertilizingFreq")}
                schedule={fertilizing}
                last
              />
            ) : null}
          </Card>
        </ScrollView>
      )}
    </Screen>
  );
}

function BigStat({ type, schedule }: { type: CareType; schedule: CareSchedule }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const accent = careAccent(type, colors);
  const status = careStatusView(parseDate(schedule.nextDueAt));

  return (
    <Card style={styles.bigStat}>
      <View style={styles.bigStatTop}>
        <CareIconBadge type={type} size={28} iconSize={16} radius={8} />
        <Text style={styles.bigStatLabel}>{careLabel(type)}</Text>
      </View>
      <Text style={[styles.bigStatValue, { color: accent.fg }]}>{status.label}</Text>
      <Text style={styles.bigStatWhen}>
        {t("care.lastDone", { date: formatShortDate(schedule.lastDoneAt) })}
      </Text>
    </Card>
  );
}

function FrequencyRow({
  type,
  label,
  schedule,
  last = false,
}: {
  type: CareType;
  label: string;
  schedule: CareSchedule;
  last?: boolean;
}) {
  const { radius } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={[styles.freqRow, !last && styles.freqRowBorder]}>
      <CareIconBadge type={type} size={32} iconSize={17} radius={radius.sm} />
      <View style={styles.flex}>
        <Text style={styles.freqTitle}>{label}</Text>
        <Text style={styles.freqSub}>
          {t("care.lastDone", { date: formatShortDate(schedule.lastDoneAt) })}
        </Text>
      </View>
      <Text style={styles.freqValue}>{t("care.everyDays", { count: schedule.intervalDays })}</Text>
    </View>
  );
}

const makeStyles = (t2: Theme) =>
  StyleSheet.create({
    flex: { flex: 1, minWidth: 0 },
    content: { padding: t2.spacing.lg },
    stats: { flexDirection: "row", gap: t2.spacing.md, marginBottom: t2.spacing.lg },
    bigStat: { flex: 1 },
    bigStatTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: t2.spacing.sm,
      marginBottom: t2.spacing.sm,
    },
    bigStatLabel: {
      fontSize: 11,
      color: t2.colors.inkSoft,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      fontWeight: "600",
    },
    bigStatValue: { fontSize: 20, fontWeight: "800", letterSpacing: -0.2 },
    bigStatWhen: { fontSize: 11.5, color: t2.colors.inkSoft, marginTop: 2 },
    actions: { flexDirection: "row", gap: t2.spacing.md, marginBottom: t2.spacing.lg },
    actionButton: { flex: 1 },
    freqRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t2.spacing.md,
      padding: 14,
    },
    freqRowBorder: { borderBottomWidth: 1, borderBottomColor: t2.colors.line },
    freqTitle: { fontSize: 13.5, fontWeight: "600", color: t2.colors.ink },
    freqSub: { fontSize: 12, color: t2.colors.inkSoft },
    freqValue: {
      fontSize: 13,
      fontWeight: "700",
      color: t2.colors.ink2,
      fontVariant: ["tabular-nums"],
    },
  });
