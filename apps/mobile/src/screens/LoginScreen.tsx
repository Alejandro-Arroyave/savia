import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Theme } from "../theme/ThemeProvider";
import { useThemedStyles } from "../theme/useThemedStyles";
import { useAuth } from "../auth/AuthContext";
import { t } from "../i18n";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import type { AuthStackScreenProps } from "../navigation/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginScreen({ navigation }: AuthStackScreenProps<"Login">) {
  const { signIn } = useAuth();
  const styles = useThemedStyles(makeStyles);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSignIn() {
    const trimmed = email.trim();
    if (!trimmed) return setError(t("auth.emailRequired"));
    if (!EMAIL_RE.test(trimmed)) return setError(t("auth.emailInvalid"));
    setError(null);
    setSubmitting(true);
    try {
      await signIn(trimmed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logo}>
            <View style={styles.mark}>
              <Icon name="feather" size={34} color="#EAF3E2" />
            </View>
            <Text style={styles.brand}>{t("common.appName")}</Text>
            <Text style={styles.tagline}>{t("auth.tagline")}</Text>
          </View>

          <TextField
            label={t("auth.email")}
            icon="mail"
            value={email}
            onChangeText={setEmail}
            error={error ?? undefined}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <TextField
            label={t("auth.password")}
            icon="lock"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
          />

          <Button
            label={t("auth.signIn")}
            onPress={handleSignIn}
            loading={submitting}
          />

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.or}>{t("auth.or")}</Text>
            <View style={styles.line} />
          </View>

          {/* Login social real llega con la integración de Auth0. */}
          <Button label={t("auth.continueWithGoogle")} variant="ghost" onPress={handleSignIn} />

          <Pressable
            accessibilityRole="link"
            onPress={() => navigation.navigate("Register")}
            style={styles.footer}
          >
            <Text style={styles.footerText}>
              {t("auth.noAccount")} <Text style={styles.footerLink}>{t("auth.createAccount")}</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const makeStyles = (t2: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    content: {
      padding: t2.spacing.xl,
      paddingTop: t2.spacing.xxl,
      flexGrow: 1,
      justifyContent: "center",
    },
    logo: { alignItems: "center", gap: t2.spacing.md, marginBottom: t2.spacing.xxl },
    mark: {
      width: 64,
      height: 64,
      borderRadius: 19,
      backgroundColor: t2.colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    brand: {
      fontFamily: t2.fontFamily.serif,
      fontSize: 34,
      fontWeight: "600",
      color: t2.colors.ink,
    },
    tagline: { fontSize: 13.5, color: t2.colors.inkSoft },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      gap: t2.spacing.md,
      marginVertical: t2.spacing.lg,
    },
    line: { flex: 1, height: 1, backgroundColor: t2.colors.line },
    or: { fontSize: 12, color: t2.colors.inkSoft },
    footer: { marginTop: t2.spacing.lg, alignItems: "center" },
    footerText: { fontSize: 13, color: t2.colors.inkSoft },
    footerLink: { color: t2.colors.primary, fontWeight: "700" },
  });
