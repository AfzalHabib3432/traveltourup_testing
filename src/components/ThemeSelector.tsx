"use client";

import React, { useCallback } from "react";
import { Moon, Sun, Palette } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { THEME_VARIANTS } from "@/config/theme.config";
import type { ThemeVariant } from "@/types";

const VARIANT_COLORS = {
  ocean: "#0e90c7",
  sapphire: "#1d4ed8",
  crimson: "#be123c",
  aurora: "#7c3aed",
  sunset: "#b45309",
};

interface ThemeSelectorProps {
  variant?: "dropdown" | "compact";
  className?: string;
}

export function ThemeSelector({ variant = "dropdown", className = "" }: ThemeSelectorProps) {
  const { theme, setTheme, themeVariant, setThemeVariant } = useTheme();

  const toggleMode = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          type="button"
          onClick={toggleMode}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted hover:bg-muted/80 text-muted-foreground hover:text-primary transition-colors duration-200"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" aria-hidden />
          ) : (
            <Moon className="w-5 h-5" aria-hidden />
          )}
        </button>
      </div>
    );
  }

  // return (
  //   <div className={`flex flex-col gap-3 ${className}`}>
  //     <div className="flex items-center justify-between">
  //       <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
  //         <Palette className="w-4 h-4" />
  //         Theme
  //       </span>
  //       <button
  //         type="button"
  //         onClick={toggleMode}
  //         className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted hover:bg-muted/80 text-muted-foreground hover:text-primary transition-colors duration-200"
  //         aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
  //       >
  //         {theme === "dark" ? (
  //           <Sun className="w-5 h-5" aria-hidden />
  //         ) : (
  //           <Moon className="w-5 h-5" aria-hidden />
  //         )}
  //       </button>
  //     </div>
  //     <div className="flex flex-wrap gap-2">
  //       {Object.entries(THEME_VARIANTS).map(([id, { name }]) => (
  //         <button
  //           key={id}
  //           type="button"
  //           onClick={() => setThemeVariant(id as ThemeVariant)}
  //           className={`group flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all duration-200 ${
  //             themeVariant === id
  //               ? "border-primary bg-primary/10 text-primary"
  //               : "border-border bg-muted/50 hover:border-primary/50 hover:bg-primary/5 text-foreground"
  //           }`}
  //           title={name}
  //           aria-label={`Select ${name} theme`}
  //           aria-pressed={themeVariant === id}
  //         >
  //           <span
  //             className="w-4 h-4 rounded-full shrink-0 ring-2 ring-current ring-offset-2 ring-offset-background"
  //             style={{ backgroundColor: VARIANT_COLORS[id as keyof typeof VARIANT_COLORS] || "#0e90c7" }}
  //             aria-hidden
  //           />
  //           <span className="text-sm font-medium hidden sm:inline">{name}</span>
  //         </button>
  //       ))}
  //     </div>
  //   </div>
  // );
}
