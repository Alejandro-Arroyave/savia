import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import type { Theme } from "../theme/ThemeProvider";
import { useThemedStyles } from "../theme/useThemedStyles";
import { useAuth } from "../auth/AuthContext";
import { t } from "../i18n";
import { Screen } from "../components/Screen";
import { AppBar } from "../components/AppBar";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import type { AuthStackScreenProps } from "../navigation/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterScreen({ navigation }: AuthStackScreenProps<"Register">) {
  const { signIn } = useAuth();
  const styles = useThemedStyles(makeStyles);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) return setError(t("auth.emailInvalid"));
    setError(null);
    setSubmitting(true);
    try {
      // Con Auth0 real, aquí se registraría al usuario; en dev basta el email.
      await signIn(trimmed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <AppBar title={t("auth.createAccount")} onBack={navigation.goBack} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TextField
            label={t("auth.name")}
            icon="user"
            value={name}
            onChangeText={setName}
            autoComplete="name"
          />
          <TextField
            label={t("auth.email")}
            icon="mail"
            value={email}
            onChangeText={setEmail}
            error={error ?? undefined}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextField
            label={t("auth.password")}
            icon="lock"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password-new"
          />
          <Text style={styles.hint}>{t("auth.passwordHint")}</Text>

          <Button label={t("auth.createAccount")} onPress={handleCreate} loading={submitting} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const makeStyles = (t2: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    content: { padding: t2.spacing.xl },
    hint: {
      fontSize: 11.5,
      color: t2.colors.inkSoft,
      marginBottom: t2.spacing.md,
      marginHorizontal: 2,
    },
  });
