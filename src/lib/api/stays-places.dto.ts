/** Duffel place suggestion mapped for hotel (Stays) location autocomplete. */
export type HotelLocationSuggestionDto = {
  id: string;
  type: "airport" | "city";
  name: string;
  city_name?: string;
  iata_code: string;
  iata_country_code?: string;
  latitude: number;
  longitude: number;
};
