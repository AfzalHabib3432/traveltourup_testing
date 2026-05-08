"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  THEME_VARIANTS,
  DEFAULT_THEME_VARIANT,
  THEME_STORAGE_KEYS,
} from "@/config/theme.config";
import type { ThemeMode, ThemeVariant } from "@/types";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  themeVariant: ThemeVariant;
  setThemeVariant: (variant: ThemeVariant) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}

function applyToDOM(mode: ThemeMode, variant: ThemeVariant): void {
  const root = document.documentElement;
  if (mode === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  root.setAttribute("data-theme", variant || DEFAULT_THEME_VARIANT);
}

export function ThemeProvider({ children, defaultTheme = "light" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [themeVariant, setThemeVariantState] = useState<ThemeVariant>(DEFAULT_THEME_VARIANT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedMode = localStorage.getItem(THEME_STORAGE_KEYS.mode);
    const storedVariant = localStorage.getItem(THEME_STORAGE_KEYS.variant);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const resolvedMode =
      storedMode ||
      (defaultTheme === "system" ? "light" : defaultTheme);    
      const resolvedVariant =
      storedVariant && THEME_VARIANTS[storedVariant as ThemeVariant] ? storedVariant : DEFAULT_THEME_VARIANT;

    setThemeState(resolvedMode as ThemeMode);
    setThemeVariantState(resolvedVariant as ThemeVariant);
    applyToDOM(resolvedMode as ThemeMode, resolvedVariant as ThemeVariant);
  }, [defaultTheme]);

  const setTheme = (value: ThemeMode) => {
    const mode = value === "dark" ? "dark" : "light";
    localStorage.setItem(THEME_STORAGE_KEYS.mode, mode);
    setThemeState(mode);
    applyToDOM(mode, themeVariant);
  };

  const setThemeVariant = (value: ThemeVariant) => {
    const variant = THEME_VARIANTS[value] ? value : DEFAULT_THEME_VARIANT;
    localStorage.setItem(THEME_STORAGE_KEYS.variant, variant);
    setThemeVariantState(variant);
    applyToDOM(theme, variant);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themeVariant,
        setThemeVariant,
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
