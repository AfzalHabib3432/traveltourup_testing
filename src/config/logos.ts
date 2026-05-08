import type { ThemeVariant } from "@/types";

export const VARIANT_LOGOS: Record<ThemeVariant, string> = {
  ocean: "/images/assets/logo.png",
  sapphire: "/images/assets/sapphire_logo.png",
  crimson: "/images/assets/crimson_logo.png",
  aurora: "/images/assets/aurora_logo.png",
  sunset: "/images/assets/sunset_logo.png",
};

export const DEFAULT_LOGO = VARIANT_LOGOS.ocean;
