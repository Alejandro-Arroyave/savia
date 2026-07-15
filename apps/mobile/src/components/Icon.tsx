import { Feather } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";

// Set de iconos único (Feather, contorno) para un lenguaje visual consistente.
export type IconName = keyof typeof Feather.glyphMap;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 20, color }: IconProps) {
  const { colors } = useTheme();
  return <Feather name={name} size={size} color={color ?? colors.ink2} />;
}
