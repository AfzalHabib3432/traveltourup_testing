/**
 * Default search coordinates (lat, lng) and radius (km) for hotel destinations.
 * Used when the user picks a city from `DESTINATIONS` for Duffel Stays search.
 */
export const STAY_DESTINATION_COORDS: Record<
  string,
  { latitude: number; longitude: number; radius: number }
> = {
  NYC: { latitude: 40.7128, longitude: -74.006, radius: 15 },
  LON: { latitude: 51.5074, longitude: -0.1278, radius: 20 },
  PAR: { latitude: 48.8566, longitude: 2.3522, radius: 20 },
  TYO: { latitude: 35.6762, longitude: 139.6503, radius: 25 },
  DXB: { latitude: 25.2048, longitude: 55.2708, radius: 25 },
  SIN: { latitude: 1.3521, longitude: 103.8198, radius: 15 },
  BKK: { latitude: 13.7563, longitude: 100.5018, radius: 20 },
  SYD: { latitude: -33.8688, longitude: 151.2093, radius: 20 },
  ROM: { latitude: 41.9028, longitude: 12.4964, radius: 20 },
  BCN: { latitude: 41.3851, longitude: 2.1734, radius: 15 },
  LAX: { latitude: 34.0522, longitude: -118.2437, radius: 25 },
  CHI: { latitude: 41.8781, longitude: -87.6298, radius: 20 },
};

export function coordsForDestinationCode(code: string | undefined | null) {
  if (!code) return null;
  return STAY_DESTINATION_COORDS[code.toUpperCase()] ?? null;
}
