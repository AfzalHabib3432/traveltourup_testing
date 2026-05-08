"use client";

import type { BookingDetailDto, BookingListItemDto } from "@/lib/bookings/booking.types";
import { apiJson, apiPaginatedJson } from "@/lib/http/api-client";

const BOOKINGS_V1_BASE = "/api/v1/bookings";

export async function listMyBookings(params?: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
}) {
  return apiPaginatedJson<BookingListItemDto>(BOOKINGS_V1_BASE, params);
}

export async function getBooking(id: string): Promise<BookingDetailDto> {
  return apiJson<BookingDetailDto>(`${BOOKINGS_V1_BASE}/${encodeURIComponent(id)}`);
}
