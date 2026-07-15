import { useCallback, useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@apollo/client";
import { careStatus } from "@savia/shared";
import type { Theme } from "../theme/ThemeProvider";
import { useTheme } from "../theme/ThemeProvider";
import { useThemedStyles } from "../theme/useThemedStyles";
import { t } from "../i18n";
import { parseDate } from "../domain/date";
import {
  ME_QUERY,
  MY_PLANTS_QUERY,
  type Me,
  type Plant,
} from "../graphql/operations";
import { Screen } from "../components/Screen";
import { AppBar } from "../components/AppBar";
import { PlantCard } from "../components/PlantCard";
import { Card } from "../components/Card";
import { Icon } from "../components/Icon";
import { Button } from "../components/Button";
import { LoadingView, ErrorView, EmptyView } from "../components/StateViews";
import type { TabScreenProps } from "../navigation/types";

interface DueSummary {
  total: number;
  waterings: number;
  fertilizings: number;
}

/** Cuenta las tareas que ya vencen hoy o están atrasadas, separadas por tipo. */
function summarizeDue(plants: Plant[]): DueSummary {
  const summary: DueSummary = { total: 0, waterings: 0, fertilizings: 0 };
  for (const plant of plants) {
    for (const schedule of plant.schedules) {
      const due = parseDate(schedule.nextDueAt);
      if (!due) continue;
      const status = careStatus(due);
      if (status.kind === "today" || status.kind === "overdue") {
        summary.total += 1;
        if (schedule.type === "WATERING") summary.waterings += 1;
        else summary.fertilizings += 1;
      }
    }
  }
  return summary;
}

export function PlantsScreen({ navigation }: TabScreenProps<"Plants">) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const meQuery = useQuery<{ me: Me | null }>(ME_QUERY);
  const plantsQuery = useQuery<{ myPlants: Plant[] }>(MY_PLANTS_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  const plants = plantsQuery.data?.myPlants ?? [];
  const summary = useMemo(() => summarizeDue(plants), [plants]);
  const firstName = meQuery.data?.me?.name?.split(" ")[0] ?? meQuery.data?.me?.email ?? "";

  const openDetail = useCallback(
    (plantId: string) => navigation.navigate("PlantDetail", { plantId }),
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Plant }) => <PlantCard plant={item} onPress={openDetail} />,
    [openDetail],
  );

  const loading = plantsQuery.loading && plants.length === 0;

  return (
    <Screen>
      <AppBar
        title={t("plants.title")}
        subtitle={firstName ? t("plants.greeting", { name: firstName }) : undefined}
        action={{
          icon: "settings",
          accessibilityLabel: t("tabs.settings"),
          onPress: () => navigation.navigate("Settings"),
        }}
      />

      {loading ? (
        <LoadingView />
      ) : plantsQuery.error ? (
        <ErrorView onRetry={() => plantsQuery.refetch()} />
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={Separator}
          refreshing={plantsQuery.loading}
          onRefresh={() => plantsQuery.refetch()}
          ListHeaderComponent={
            plants.length > 0 ? <TodaySummary summary={summary} /> : null
          }
          ListEmptyComponent={
            <EmptyView
              message={t("plants.empty")}
              cta={
                <Button
                  label={t("plants.emptyCta")}
                  icon="plus"
                  onPress={() => navigation.navigate("AddPlant")}
                />
              }
            />
          }
        />
      )}

      {plants.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("plants.add")}
          onPress={() => navigation.navigate("AddPlant")}
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        >
          <Icon name="plus" size={24} color={colors.onPrimary} />
        </Pressable>
      ) : null}
    </Screen>
  );
}

function Separator() {
  const styles = useThemedStyles(makeStyles);
  return <View style={styles.separator} />;
}

function TodaySummary({ summary }: { summary: DueSummary }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { total, waterings, fertilizings } = summary;

  return (
    <Card style={styles.todayCard}>
      <View style={styles.todayIcon}>
        <Icon name="check-circle" size={19} color={colors.onPrimary} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.todayTitle}>
          {total > 0 ? t("plants.todayTasks", { count: total }) : t("plants.noTasksToday")}
        </Text>
        {total > 0 ? (
          <Text style={styles.todayDetail}>
            {waterings > 0 ? t("plants.wateringCount", { count: waterings }) : ""}
            {waterings > 0 && fertilizings > 0 ? " · " : ""}
            {fertilizings > 0 ? t("plants.fertilizingCount", { count: fertilizings }) : ""}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

const makeStyles = (t2: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    list: { padding: t2.spacing.lg, paddingBottom: 96, flexGrow: 1 },
    separator: { height: t2.spacing.md },
    todayCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: t2.spacing.md,
      marginBottom: t2.spacing.lg,
    },
    todayIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: t2.colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    todayTitle: { fontSize: 14, fontWeight: "700", color: t2.colors.ink },
    todayDetail: { fontSize: 12.5, color: t2.colors.inkSoft, marginTop: 2 },
    fab: {
      position: "absolute",
      right: t2.spacing.lg,
      bottom: t2.spacing.xl,
      width: 54,
      height: 54,
      borderRadius: 17,
      backgroundColor: t2.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    fabPressed: { opacity: 0.9 },
  });
