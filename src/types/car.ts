export interface Car {
  id: number;
  name: string;
  brand: string;
  type: CarType;
  pricePerDay: number;
  currency: string;
  image: string;
  seats: number;
  transmission: "automatic" | "manual";
  fuelType: "petrol" | "diesel" | "electric" | "hybrid";
  supplier: string;
}

export type CarType = "sedan" | "suv" | "hatchback" | "luxury" | "van" | "convertible";

export interface CarSearchParams {
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  driverAge: number;
}

/** Extended car listing for search results (CarList display) */
export interface CarListing {
  id: number;
  name: string;
  type: string;
  category: string;
  supplier: string;
  supplierRating: number;
  supplierReviews: number;
  pricePerDay: number;
  totalPrice: number;
  discount?: number;
  originalPrice?: number;
  transmission: string;
  fuel: string;
  seats: number;
  bags: number;
  doors: number;
  mileage: string;
  features: string[];
  included: string[];
  freeCancellation: boolean;
  instantConfirmation: boolean;
  rating: number;
  reviews: number;
  location: string;
  distance: string;
  pickupTime: string;
  tags: string[];
  deals: { type: string; text: string; highlight?: boolean }[];
  /** Optional image gallery for detail page */
  images?: string[];
  score: {
    value: number;
    condition: number;
    comfort: number;
    features: number;
    valueScore: number;
  };
}
