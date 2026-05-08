export interface Hotel {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  currency: string;
  image: string;
  amenities: string[];
  starRating: 1 | 2 | 3 | 4 | 5;
}

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: GuestConfig;
  rooms: number;
}

export interface GuestConfig {
  adults: number;
  children: number;
}

export interface RoomOption {
  id: number;
  name: string;
  type: string;
  price: number;
  capacity: number;
  amenities: string[];
}
