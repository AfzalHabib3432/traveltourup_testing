import type {
  serializeBookingListWithRelations,
  serializeBookingWithRelations,
} from "@/lib/api/serialize";

/** Full booking row from `GET /api/v1/bookings/:id`. */
export type BookingDetailDto = ReturnType<typeof serializeBookingWithRelations>;

/** Slim list row from `GET /api/v1/bookings`. */
export type BookingListItemDto = ReturnType<typeof serializeBookingListWithRelations>;
