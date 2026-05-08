export interface HotelDestination {
  code: string;
  name: string;
  country: string;
  type: string;
}

export const DESTINATIONS: HotelDestination[] = [
  { code: "NYC", name: "New York City", country: "United States", type: "City" },
  { code: "LON", name: "London", country: "United Kingdom", type: "City" },
  { code: "PAR", name: "Paris", country: "France", type: "City" },
  { code: "TYO", name: "Tokyo", country: "Japan", type: "City" },
  { code: "DXB", name: "Dubai", country: "United Arab Emirates", type: "City" },
  { code: "SIN", name: "Singapore", country: "Singapore", type: "City" },
  { code: "BKK", name: "Bangkok", country: "Thailand", type: "City" },
  { code: "SYD", name: "Sydney", country: "Australia", type: "City" },
  { code: "ROM", name: "Rome", country: "Italy", type: "City" },
  { code: "BCN", name: "Barcelona", country: "Spain", type: "City" },
  { code: "LAX", name: "Los Angeles", country: "United States", type: "City" },
  { code: "CHI", name: "Chicago", country: "United States", type: "City" },
];
