// Paleta de Savia. Los valores salen del mockup aprobado (design/savia-mockup.html).
// Neutros con sesgo verde; cada tipo de cuidado tiene color fijo ("dos ritmos").

export interface Palette {
  ground: string;
  appBg: string;
  surface: string;
  surface2: string;
  ink: string;
  ink2: string;
  inkSoft: string;
  line: string;
  lineStrong: string;
  primary: string;
  primary2: string;
  sprout: string;
  water: string;
  waterBg: string;
  earth: string;
  earthBg: string;
  danger: string;
  dangerBg: string;
  ok: string;
  /** Texto sobre superficies de color fuerte (botón primario, "Hoy"). */
  onPrimary: string;
}

export const lightPalette: Palette = {
  ground: "#E9EEE1",
  appBg: "#F4F7EE",
  surface: "#FFFFFF",
  surface2: "#F2F5EC",
  ink: "#1B2416",
  ink2: "#414D38",
  inkSoft: "#6E7A62",
  line: "#DBE2CF",
  lineStrong: "#C7D1B7",
  primary: "#2E5D39",
  primary2: "#234A2C",
  sprout: "#6FA84E",
  water: "#2F86A0",
  waterBg: "#E2F0F2",
  earth: "#B57A34",
  earthBg: "#F3EAD8",
  danger: "#B4553F",
  dangerBg: "#F5E4DE",
  ok: "#4E8C46",
  onPrimary: "#F3F9EE",
};

export const darkPalette: Palette = {
  ground: "#0E140B",
  appBg: "#10160D",
  surface: "#1A2215",
  surface2: "#212B1B",
  ink: "#E9F0E1",
  ink2: "#C0CBB4",
  inkSoft: "#8B977E",
  line: "#2A3522",
  lineStrong: "#39472E",
  primary: "#7FBE84",
  primary2: "#6BAF72",
  sprout: "#8FC96A",
  water: "#63B7CE",
  waterBg: "#132A30",
  earth: "#D6A55C",
  earthBg: "#2C2413",
  danger: "#DB8069",
  dangerBg: "#33201A",
  ok: "#7CC073",
  onPrimary: "#0E140B",
};
