/** Cached featured stays strip — London test corridor (Duffel sandbox friendly). */
export const FEATURED_STAYS_REVALIDATE_SECONDS = 900;

export const FEATURED_STAYS_LOCATION = {
  latitude: 51.5071,
  longitude: -0.1416,
  radius: 5,
} as const;

export const FEATURED_STAYS_ROOMS = 1;
export const FEATURED_STAYS_GUESTS = [{ type: "adult" as const }, { type: "adult" as const }];

export const FEATURED_STAYS_CARD_LIMIT = 6;
