import { StyleSheet, View, type ViewProps } from "react-native";
import type { Theme } from "../theme/ThemeProvider";
import { useThemedStyles } from "../theme/useThemedStyles";

interface CardProps extends ViewProps {
  padded?: boolean;
}

/** Superficie con borde y radios del sistema. */
export function Card({ padded = true, style, children, ...rest }: CardProps) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View {...rest} style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.line,
      borderRadius: t.radius.lg,
      overflow: "hidden",
    },
    padded: { padding: t.spacing.md },
  });
