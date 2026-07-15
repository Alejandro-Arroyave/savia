import { useMemo } from "react";
import type { StyleSheet } from "react-native";
import { useTheme, type Theme } from "./ThemeProvider";

type NamedStyles<T> = StyleSheet.NamedStyles<T>;

/**
 * Crea estilos que dependen del tema, memoizados por tema.
 * `factory` debe ser una función estable (definida a nivel de módulo).
 */
export function useThemedStyles<T extends NamedStyles<T>>(factory: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [theme, factory]);
}
