import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useMutation } from "@apollo/client";
import type { CareType } from "@savia/shared";
import type { Theme } from "../theme/ThemeProvider";
import { useThemedStyles } from "../theme/useThemedStyles";
import { t } from "../i18n";
import { todayISODate } from "../domain/date";
import { careAccent } from "../domain/care";
import { useTheme } from "../theme/ThemeProvider";
import {
  ADD_PLANT_MUTATION,
  MY_PLANTS_QUERY,
  type CareInput,
} from "../graphql/operations";
import { Screen } from "../components/Screen";
import { AppBar } from "../components/AppBar";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import type { RootStackScreenProps } from "../navigation/types";

const DEFAULT_INTERVAL: Record<CareType, string> = { WATERING: "7", FERTILIZING: "30" };

export function AddPlantScreen({ navigation }: RootStackScreenProps<"AddPlant">) {
  const styles = useThemedStyles(makeStyles);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [wateringDays, setWateringDays] = useState(DEFAULT_INTERVAL.WATERING);
  const [fertilizingDays, setFertilizingDays] = useState(DEFAULT_INTERVAL.FERTILIZING);
  const [error, setError] = useState<string | null>(null);

  const [addPlant, { loading }] = useMutation(ADD_PLANT_MUTATION, {
    refetchQueries: [{ query: MY_PLANTS_QUERY }],
  });

  async function handleSave() {
    if (!name.trim()) return setError(t("addPlant.nameRequired"));
    const watering = Number(wateringDays);
    const fertilizing = Number(fertilizingDays);
    if (!Number.isInteger(watering) || watering <= 0 || !Number.isInteger(fertilizing) || fertilizing <= 0) {
      return setError(t("addPlant.intervalInvalid"));
    }
    setError(null);

    // Nota: la última fecha se asume "hoy" al registrar. Un selector de fecha
    // para editarla queda como mejora posterior.
    const today = todayISODate();
    const care: CareInput[] = [
      { type: "WATERING", intervalDays: watering, lastDoneAt: today },
      { type: "FERTILIZING", intervalDays: fertilizing, lastDoneAt: today },
    ];

    await addPlant({
      variables: { name: name.trim(), species: species.trim() || null, care },
    });
    navigation.goBack();
  }

  return (
    <Screen>
      <AppBar title={t("addPlant.title")} onBack={navigation.goBack} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TextField
            label={t("addPlant.name")}
            icon="feather"
            value={name}
            onChangeText={setName}
            error={error ?? undefined}
          />
          <TextField
            label={`${t("addPlant.species")} ${t("common.optional")}`}
            value={species}
            onChangeText={setSpecies}
            placeholder={t("addPlant.speciesPlaceholder")}
          />

          <CareSection
            type="WATERING"
            title={t("addPlant.watering")}
            interval={wateringDays}
            onChangeInterval={setWateringDays}
          />
          <CareSection
            type="FERTILIZING"
            title={t("addPlant.fertilizing")}
            interval={fertilizingDays}
            onChangeInterval={setFertilizingDays}
          />

          <View style={styles.saveButton}>
            <Button label={t("addPlant.save")} icon="check" onPress={handleSave} loading={loading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

interface CareSectionProps {
  type: CareType;
  title: string;
  interval: string;
  onChangeInterval: (value: string) => void;
}

function CareSection({ type, title, interval, onChangeInterval }: CareSectionProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const accent = careAccent(type, colors);
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Icon name={type === "WATERING" ? "droplet" : "feather"} size={16} color={accent.fg} />
        <Text style={[styles.sectionTitle, { color: accent.fg }]}>{title}</Text>
      </View>
      <TextField
        label={`${t("addPlant.every")} (${t("common.days")})`}
        value={interval}
        onChangeText={onChangeInterval}
        keyboardType="number-pad"
      />
    </View>
  );
}

const makeStyles = (t2: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    content: { padding: t2.spacing.xl },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: t2.spacing.sm,
      marginTop: t2.spacing.md,
      marginBottom: t2.spacing.sm,
      marginHorizontal: 2,
    },
    sectionTitle: {
      fontWeight: "700",
      fontSize: 13,
      letterSpacing: 0.5,
    },
    saveButton: { marginTop: t2.spacing.lg },
  });
