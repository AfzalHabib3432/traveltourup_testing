export type ThemeMode = "light" | "dark" | "system";

export type ThemeVariant = "ocean" | "sapphire" | "crimson" | "aurora" | "sunset";

export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  ring: string;
}

export interface ThemeVariantConfig {
  id: ThemeVariant;
  name: string;
  description?: string;
  light: ThemeColors;
  dark: ThemeColors;
}

export interface ThemeContextValue {
  theme: ThemeMode;
  themeVariant: ThemeVariant;
  setTheme: (theme: ThemeMode) => void;
  setThemeVariant: (variant: ThemeVariant) => void;
  mounted: boolean;
}
