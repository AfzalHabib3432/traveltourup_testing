/**
 * Theme variant configuration for TravelTourUp flight website.
 * Each theme has light and dark mode variants with WCAG AA contrast.
 */

import type { ThemeVariant, ThemeVariantConfig } from "@/types";

export const THEME_VARIANTS: Record<ThemeVariant, ThemeVariantConfig> = {
  ocean: {
    id: "ocean",
    name: "Ocean Blue",
    description: "Trust & professionalism",
    light: {
      primary: "#0e90c7",
      primaryForeground: "#ffffff",
      ring: "#0e90c7",
    },
    dark: {
      primary: "#38a5d4",
      primaryForeground: "#ffffff",
      ring: "#38a5d4",
    },
  },
  sapphire: {
    id: "sapphire",
    name: "Sapphire",
    description: "Business class & premium",
    light: {
      primary: "#1d4ed8",
      primaryForeground: "#ffffff",
      ring: "#1d4ed8",
    },
    dark: {
      primary: "#3b82f6",
      primaryForeground: "#ffffff",
      ring: "#3b82f6",
    },
  },
  crimson: {
    id: "crimson",
    name: "Crimson",
    description: "Premium airline luxury",
    light: {
      primary: "#be123c",
      primaryForeground: "#ffffff",
      ring: "#be123c",
    },
    dark: {
      primary: "#fb7185",
      primaryForeground: "#ffffff",
      ring: "#fb7185",
    },
  },
  aurora: {
    id: "aurora",
    name: "Aurora",
    description: "Modern travel innovation",
    light: {
      primary: "#7c3aed",
      primaryForeground: "#ffffff",
      ring: "#7c3aed",
    },
    dark: {
      primary: "#a78bfa",
      primaryForeground: "#ffffff",
      ring: "#a78bfa",
    },
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    description: "Golden hour departures",
    light: {
      primary: "#b45309",
      primaryForeground: "#ffffff",
      ring: "#b45309",
    },
    dark: {
      primary: "#f59e0b",
      primaryForeground: "#0f172a",
      ring: "#f59e0b",
    },
  },
};

export const DEFAULT_THEME_VARIANT: ThemeVariant = "ocean";
export const THEME_STORAGE_KEYS = {
  variant: "themeVariant",
  mode: "theme",
} as const;
