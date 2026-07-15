import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { darkPalette, lightPalette, type Palette } from "./colors";
import { fontFamily, fontSize, radius, spacing } from "./tokens";

export interface Theme {
  scheme: "light" | "dark";
  colors: Palette;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
  fontFamily: typeof fontFamily;
}

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme() ?? "light";
  const theme = useMemo<Theme>(
    () => ({
      scheme,
      colors: scheme === "dark" ? darkPalette : lightPalette,
      spacing,
      radius,
      fontSize,
      fontFamily,
    }),
    [scheme],
  );
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  }
  return theme;
}
