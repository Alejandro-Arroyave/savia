// Escalas de espaciado, radios y tipografía. Constantes para no esparcir
// "números mágicos" por los estilos.

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const radius = {
  sm: 9,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 12.5,
  md: 14,
  lg: 15.5,
  xl: 20,
  display: 26,
} as const;

// Serif humanista para identidad/títulos; system-ui para la interfaz.
export const fontFamily = {
  serif: "Iowan Old Style",
  sans: "System",
} as const;
