import { memo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { CareType } from "@savia/shared";
import type { Theme } from "../theme/ThemeProvider";
import { useThemedStyles } from "../theme/useThemedStyles";
import { careStatusView } from "../domain/care";
import { parseDate } from "../domain/date";
import type { Plant } from "../graphql/operations";
import { CareStatChip } from "./CareStatChip";
import { Icon } from "./Icon";

interface PlantCardProps {
  plant: Plant;
  onPress: (plantId: string) => void;
}

function scheduleFor(plant: Plant, type: CareType) {
  return plant.schedules.find((s) => s.type === type) ?? null;
}

function PlantCardComponent({ plant, onPress }: PlantCardProps) {
  const styles = useThemedStyles(makeStyles);
  const watering = scheduleFor(plant, "WATERING");
  const fertilizing = scheduleFor(plant, "FERTILIZING");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={plant.name}
      onPress={() => onPress(plant.id)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.head}>
        {plant.photoUrl ? (
          <Image source={{ uri: plant.photoUrl }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Icon name="feather" size={22} color="#EAF3E2" />
          </View>
        )}
        <View style={styles.headText}>
          <Text style={styles.name} numberOfLines={1}>
            {plant.name}
          </Text>
          {plant.species ? (
            <Text style={styles.species} numberOfLines={1}>
              {plant.species}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.statusRow}>
        {watering ? (
          <CareStatChip type="WATERING" status={careStatusView(parseDate(watering.nextDueAt))} />
        ) : null}
        {fertilizing ? (
          <CareStatChip
            type="FERTILIZING"
            status={careStatusView(parseDate(fertilizing.nextDueAt))}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

export const PlantCard = memo(PlantCardComponent);

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.line,
      borderRadius: t.radius.lg,
      padding: t.spacing.md,
      gap: t.spacing.md,
    },
    pressed: { opacity: 0.9 },
    head: { flexDirection: "row", alignItems: "center", gap: 13 },
    thumb: {
      width: 60,
      height: 60,
      borderRadius: t.radius.md,
      backgroundColor: t.colors.surface2,
    },
    thumbPlaceholder: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.colors.primary,
    },
    headText: { flex: 1, minWidth: 0, gap: 3 },
    name: { fontWeight: "700", fontSize: 15.5, color: t.colors.ink },
    species: { fontSize: 12, color: t.colors.inkSoft, fontStyle: "italic" },
    statusRow: { gap: 7 },
  });
