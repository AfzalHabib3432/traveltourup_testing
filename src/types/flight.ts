export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface Flight {
  id: number;
  airline: string;
  airlineLogo?: string;
  from: string;
  to: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  cabinClass: CabinClass;
}

export type CabinClass = "economy" | "premium-economy" | "business" | "first";

export type TripType = "one-way" | "round-trip" | "multi-city";

export interface Travelers {
  adults: number;
  children: number;
  infants: number;
}

export interface FlightSearchParams {
  tripType: TripType;
  cabinClass: CabinClass;
  travelers: Travelers;
  from: Airport | null;
  to: Airport | null;
  departDate: string;
  returnDate?: string;
}

export interface FeaturedFlight {
  id: number;
  title: string;
  airline: string;
  price: number;
  image: string;
  from: string;
  to: string;
}
