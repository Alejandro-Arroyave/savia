import { useState } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import type { Theme } from "../theme/ThemeProvider";
import { useTheme } from "../theme/ThemeProvider";
import { useThemedStyles } from "../theme/useThemedStyles";
import { Icon, type IconName } from "./Icon";

interface TextFieldProps extends Omit<TextInputProps, "style"> {
  label?: string;
  icon?: IconName;
  error?: string;
}

export function TextField({ label, icon, error, ...inputProps }: TextFieldProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputRow,
          focused && styles.inputRowFocused,
          error != null && styles.inputRowError,
        ]}
      >
        {icon ? <Icon name={icon} size={17} color={colors.inkSoft} /> : null}
        <TextInput
          {...inputProps}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          placeholderTextColor={colors.inkSoft}
          style={styles.input}
        />
      </View>
      {error != null ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    container: { marginBottom: t.spacing.md },
    label: {
      fontSize: 12.5,
      fontWeight: "600",
      color: t.colors.ink2,
      marginBottom: t.spacing.xs + 2,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing.sm,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.lineStrong,
      borderRadius: t.radius.md,
      paddingHorizontal: 13,
      paddingVertical: 4,
    },
    inputRowFocused: { borderColor: t.colors.primary },
    inputRowError: { borderColor: t.colors.danger },
    input: {
      flex: 1,
      color: t.colors.ink,
      fontSize: 14,
      paddingVertical: 9,
    },
    error: {
      color: t.colors.danger,
      fontSize: 11.5,
      marginTop: t.spacing.xs,
    },
  });
