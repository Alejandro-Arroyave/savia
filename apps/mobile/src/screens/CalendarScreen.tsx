import { useMemo, useState } from "react";
import { Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@apollo/client";
import type { CareType } from "@savia/shared";
import type { Theme } from "../theme/ThemeProvider";
import { useTheme } from "../theme/ThemeProvider";
import { useThemedStyles } from "../theme/useThemedStyles";
import { i18n, t } from "../i18n";
import { careLabel, careStatusView } from "../domain/care";
import {
  buildMonthCells,
  buildUpcoming,
  countByType,
  monthInfo,
  type UpcomingTask,
} from "../domain/calendar";
import {
  CALENDAR_EVENTS_QUERY,
  MY_PLANTS_QUERY,
  type CareEvent,
  type Plant,
} from "../graphql/operations";
import { Screen } from "../components/Screen";
import { AppBar } from "../components/AppBar";
import { Card } from "../components/Card";
import { Icon } from "../components/Icon";
import { CareIconBadge } from "../components/CareIconBadge";
import { EmptyView } from "../components/StateViews";

interface AgendaSection {
  title: string;
  data: UpcomingTask[];
}

export function CalendarScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [monthOffset, setMonthOffset] = useState(0);

  const info = useMemo(() => monthInfo(monthOffset), [monthOffset]);

  const eventsQuery = useQuery<{ calendarEvents: CareEvent[] }>(CALENDAR_EVENTS_QUERY, {
    variables: { from: info.fromISO, to: info.toISO },
  });
  const plantsQuery = useQuery<{ myPlants: Plant[] }>(MY_PLANTS_QUERY);

  const events = eventsQuery.data?.calendarEvents ?? [];
  const plants = plantsQuery.data?.myPlants ?? [];

  const cells = useMemo(() => buildMonthCells(info, events, plants), [info, events, plants]);
  const counts = useMemo(() => countByType(events), [events]);
  const sections = useMemo<AgendaSection[]>(() => groupUpcoming(buildUpcoming(plants)), [plants]);

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(i18n.locale, { weekday: "narrow" });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i)));
  }, []);

  const monthLabel = new Intl.DateTimeFormat(i18n.locale, {
    month: "long",
    year: "numeric",
  }).format(new Date(info.year, info.month, 1));

  return (
    <Screen>
      <AppBar title={t("calendar.title")} subtitle={t("calendar.subtitle")} />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.content}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View>
            <View style={styles.summary}>
              <SummaryTile type="WATERING" label={t("calendar.waterings")} value={counts.waterings} />
              <SummaryTile
                type="FERTILIZING"
                label={t("calendar.fertilizings")}
                value={counts.fertilizings}
              />
            </View>

            <Card style={styles.calCard}>
              <View style={styles.calHeader}>
                <Text style={styles.monthLabel}>{capitalize(monthLabel)}</Text>
                <View style={styles.navRow}>
                  <NavButton icon="chevron-left" onPress={() => setMonthOffset((o) => o - 1)} />
                  <NavButton icon="chevron-right" onPress={() => setMonthOffset((o) => o + 1)} />
                </View>
              </View>

              <View style={styles.weekRow}>
                {weekdays.map((wd, i) => (
                  <Text key={i} style={styles.weekday}>
                    {wd}
                  </Text>
                ))}
              </View>

              <View style={styles.grid}>
                {cells.map((cell, i) => (
                  <View key={i} style={styles.cell}>
                    {cell.day != null ? (
                      <View style={[styles.dayInner, cell.isToday && styles.dayToday]}>
                        <Text style={[styles.dayNum, cell.isToday && styles.dayNumToday]}>
                          {cell.day}
                        </Text>
                        <View style={styles.dots}>
                          {cell.water ? (
                            <View style={[styles.dot, { backgroundColor: colors.water }]} />
                          ) : null}
                          {cell.earth ? (
                            <View style={[styles.dot, { backgroundColor: colors.earth }]} />
                          ) : null}
                        </View>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>

              <View style={styles.legend}>
                <LegendItem color={colors.water} label={t("care.watering")} />
                <LegendItem color={colors.earth} label={t("care.fertilizing")} />
                <LegendItem color={colors.primary} label={t("care.today")} />
              </View>
            </Card>

            <Text style={styles.agendaTitle}>{t("calendar.upcoming")}</Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => <AgendaRow task={item} />}
        ListEmptyComponent={<EmptyView message={t("calendar.empty")} />}
      />
    </Screen>
  );
}

function SummaryTile({ type, label, value }: { type: CareType; label: string; value: number }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Card style={styles.tile}>
      <CareIconBadge type={type} size={26} iconSize={15} radius={7} />
      <View>
        <Text style={styles.tileValue}>{value}</Text>
        <Text style={styles.tileLabel}>{label}</Text>
      </View>
    </Card>
  );
}

function AgendaRow({ task }: { task: UpcomingTask }) {
  const { radius } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const status = careStatusView(task.date);
  const isToday = status.tone === "due";

  return (
    <View style={styles.agendaItem}>
      <CareIconBadge type={task.type} size={32} iconSize={16} radius={radius.sm} />
      <View style={styles.flex}>
        <Text style={styles.agendaPlant} numberOfLines={1}>
          {task.plantName}
        </Text>
        <Text style={styles.agendaType}>{careLabel(task.type)}</Text>
      </View>
      <View style={[styles.statusPill, isToday ? styles.statusToday : styles.statusScheduled]}>
        <Text style={[styles.statusText, isToday && styles.statusTextToday]}>
          {isToday ? t("care.today") : t("calendar.scheduled")}
        </Text>
      </View>
    </View>
  );
}

function NavButton({ icon, onPress }: { icon: "chevron-left" | "chevron-right"; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
    >
      <Icon name={icon} size={14} color={colors.inkSoft} />
    </Pressable>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function groupUpcoming(tasks: UpcomingTask[]): AgendaSection[] {
  const fmt = new Intl.DateTimeFormat(i18n.locale, { weekday: "long", day: "numeric", month: "short" });
  const sections: AgendaSection[] = [];
  let currentKey = "";
  for (const task of tasks) {
    const key = task.date.toDateString();
    if (key !== currentKey) {
      sections.push({ title: capitalize(fmt.format(task.date)), data: [] });
      currentKey = key;
    }
    sections[sections.length - 1]!.data.push(task);
  }
  return sections;
}

const makeStyles = (t2: Theme) =>
  StyleSheet.create({
    flex: { flex: 1, minWidth: 0 },
    content: { padding: t2.spacing.lg, paddingBottom: t2.spacing.xxl },
    summary: { flexDirection: "row", gap: t2.spacing.sm, marginBottom: t2.spacing.md },
    tile: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: t2.spacing.sm,
    },
    tileValue: { fontSize: 16, fontWeight: "800", color: t2.colors.ink, fontVariant: ["tabular-nums"] },
    tileLabel: { fontSize: 10.5, color: t2.colors.inkSoft, textTransform: "uppercase", letterSpacing: 0.4 },
    calCard: { marginBottom: t2.spacing.lg },
    calHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: t2.spacing.md,
    },
    monthLabel: { fontFamily: t2.fontFamily.serif, fontSize: 16, fontWeight: "600", color: t2.colors.ink },
    navRow: { flexDirection: "row", gap: t2.spacing.xs + 2 },
    navButton: {
      width: 26,
      height: 26,
      borderRadius: t2.radius.sm,
      borderWidth: 1,
      borderColor: t2.colors.line,
      alignItems: "center",
      justifyContent: "center",
    },
    pressed: { opacity: 0.6 },
    weekRow: { flexDirection: "row" },
    weekday: {
      flex: 1,
      textAlign: "center",
      fontSize: 9.5,
      fontWeight: "700",
      color: t2.colors.inkSoft,
      paddingBottom: t2.spacing.xs,
      textTransform: "uppercase",
    },
    grid: { flexDirection: "row", flexWrap: "wrap" },
    cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 1.5 },
    dayInner: { flex: 1, borderRadius: t2.radius.sm, alignItems: "center", justifyContent: "center" },
    dayToday: { backgroundColor: t2.colors.primary },
    dayNum: { fontSize: 11, color: t2.colors.ink2, fontVariant: ["tabular-nums"] },
    dayNumToday: { color: t2.colors.onPrimary, fontWeight: "800" },
    dots: { flexDirection: "row", gap: 2, height: 5, marginTop: 2 },
    dot: { width: 4, height: 4, borderRadius: 2 },
    legend: {
      flexDirection: "row",
      gap: t2.spacing.lg,
      marginTop: t2.spacing.md,
      paddingTop: t2.spacing.md,
      borderTopWidth: 1,
      borderTopColor: t2.colors.line,
    },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    legendDot: { width: 9, height: 9, borderRadius: 5 },
    legendLabel: { fontSize: 12, color: t2.colors.ink2 },
    agendaTitle: {
      fontFamily: t2.fontFamily.serif,
      fontSize: 16,
      fontWeight: "600",
      color: t2.colors.ink,
      marginBottom: t2.spacing.sm,
    },
    sectionHeader: {
      fontSize: 12,
      fontWeight: "700",
      color: t2.colors.inkSoft,
      textTransform: "capitalize",
      marginTop: t2.spacing.md,
      marginBottom: t2.spacing.sm,
    },
    agendaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
      backgroundColor: t2.colors.surface,
      borderWidth: 1,
      borderColor: t2.colors.line,
      borderRadius: t2.radius.md,
      paddingHorizontal: t2.spacing.md,
      paddingVertical: 10,
      marginBottom: t2.spacing.sm,
    },
    agendaPlant: { fontWeight: "700", fontSize: 13.5, color: t2.colors.ink },
    agendaType: { fontSize: 12, color: t2.colors.inkSoft },
    statusPill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: t2.radius.pill },
    statusToday: { backgroundColor: t2.colors.primary },
    statusScheduled: { backgroundColor: t2.colors.surface2 },
    statusText: { fontSize: 10.5, fontWeight: "800", color: t2.colors.inkSoft },
    statusTextToday: { color: t2.colors.onPrimary },
  });
