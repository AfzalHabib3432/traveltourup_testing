export type BookingType = "flight" | "hotel" | "car";

export interface BookingDetails {
  type: BookingType;
  itemName: string;
  price: number;
  currency: string;
  date: string;
  passengers?: number;
  rooms?: number;
  days?: number;
}

export interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
