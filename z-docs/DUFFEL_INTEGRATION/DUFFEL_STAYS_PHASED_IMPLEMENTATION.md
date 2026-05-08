# Duffel Stays — phased implementation (delivered)

This document summarizes what is implemented in the codebase. For API contracts and webhook names, see [DUFFEL_STAYS_API_NOTES.md](./DUFFEL_STAYS_API_NOTES.md).

## Phase 0 — Contracts

- Zod: [`src/lib/validations/stays.schema.ts`](../../src/lib/validations/stays.schema.ts)
- UI DTOs: [`src/lib/api/stays-dto.ts`](../../src/lib/api/stays-dto.ts)
- Duffel JSON mappers: [`src/lib/duffel/stays-parse.ts`](../../src/lib/duffel/stays-parse.ts)
- Destination coordinates: [`src/data/stay-destination-coords.ts`](../../src/data/stay-destination-coords.ts)

## Phase 1 — BFF search, rates, featured

- `POST /api/v1/stays/search` — [`app/api/v1/stays/search/route.ts`](../../app/api/v1/stays/search/route.ts)
- `GET /api/v1/stays/search_results/[id]/rates` — [`app/api/v1/stays/search_results/[id]/rates/route.ts`](../../app/api/v1/stays/search_results/[id]/rates/route.ts)
- `POST /api/v1/stays/quotes` — [`app/api/v1/stays/quotes/route.ts`](../../app/api/v1/stays/quotes/route.ts)
- `GET /api/v1/stays/featured` — [`app/api/v1/stays/featured/route.ts`](../../app/api/v1/stays/featured/route.ts)
- Services: [`src/lib/services/stays/`](../../src/lib/services/stays/)

## Phase 2–3 — List, detail, room = rate + quote

- [`HotelsTab`](../../src/components/hotels/HotelsTab.tsx): live search → `sessionStorage` → `/hotels`
- [`HotelsList`](../../src/components/hotels/HotelsList.tsx): prefers `ttu_stays_search` results, else mock
- [`app/(booking)/hotels/[id]/page.tsx`](../../app/(booking)/hotels/[id]/page.tsx): Duffel-style ids → [`StaysHotelDetail`](../../src/views/StaysHotelDetail.tsx)
- Rates mapped to [`AvailableRooms`](../../src/components/hotels/AvailableRooms.tsx) via [`staysRateToHotelRoom`](../../src/lib/stays/stays-ui-map.ts); quote on select

## Phase 4 — Booking, DB, payment entry

- `POST /api/v1/stays/bookings` — [`app/api/v1/stays/bookings/route.ts`](../../app/api/v1/stays/bookings/route.ts) (auth + `bookings:create`, `Idempotency-Key`)
- Prisma `HotelBooking` Duffel columns — migration [`prisma/migrations/20260407120000_hotel_bookings_duffel_stays/`](../../prisma/migrations/20260407120000_hotel_bookings_duffel_stays/migration.sql)
- [`booking.repository.createHotelStayBookingFromDuffel`](../../src/lib/db/repositories/booking.repository.ts)
- [`/hotels/payment`](../../app/(booking)/hotels/payment/page.tsx): [`StaysPaymentEntry`](../../src/components/hotels/StaysPaymentEntry.tsx) + [`BookingSidebar`](../../src/components/shared/BookingSidebar.tsx) `staysQuote` branch

## Phase 5 — Webhooks + serialization

- [`duffel-webhook-handlers.ts`](../../src/lib/services/duffel/duffel-webhook-handlers.ts): `stays.*` sync `stays_raw`, cancel + `booking_creation_failed` status updates
- [`serializeHotelBookingRow`](../../src/lib/api/serialize.ts)

## Phase 6 — Featured strip

- [`FeaturedHotelsWithFetch`](../../src/components/hotels/FeaturedHotelsWithFetch.tsx) on [`Home`](../../src/views/Home.tsx) and [`Hotels`](../../src/views/Hotels.tsx); [`FeaturedHotels`](../../src/components/hotels/FeaturedHotels.tsx) supports `actionHref`

## Phase 7 — Hardening

- Rate limits on stays routes (aligned with flight search pattern)
- [`.env.example`](../../.env.example) Stays notes; E2E smoke in [DUFFEL_STAYS_API_NOTES.md](./DUFFEL_STAYS_API_NOTES.md)
- Tests: [`src/lib/validations/stays.schema.test.ts`](../../src/lib/validations/stays.schema.test.ts)
