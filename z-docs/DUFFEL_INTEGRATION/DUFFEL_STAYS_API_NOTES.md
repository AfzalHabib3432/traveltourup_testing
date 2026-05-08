# Duffel Stays — API contracts and parity (Phase 0)

## Official references

- [Getting started with Stays](https://duffel.com/docs/guides/getting-started-with-stays)
- [Searching for Stays](https://duffel.com/docs/guides/searching-for-stays)
- Stays search: `POST /stays/search`
- Fetch rates: `GET /stays/search_results/{id}/fetch_all_rates`
- Quote: `POST /stays/quotes` with `{ data: { rate_id } }`
- Booking: `POST /stays/bookings` with `quote_id`, `email`, `phone_number` (E.164), `guests[]`
- Payment: omit `payment` when using **Duffel balance**; pass `payment` for card flows per docs

## Request shapes (BFF / internal)

| Step | Our Zod schema | Duffel |
|------|----------------|--------|
| Search | `staysSearchBodySchema` | `check_in_date`, `check_out_date`, `rooms`, `guests[]`, `location` with `geographic_coordinates` + `radius` (km) |
| Quote | `staysQuoteBodySchema` | `rate_id` |
| Book | `staysBookingBodySchema` | `quote_id`, `email`, `phone_number`, `guests` (given_name, family_name, born_on), optional `accommodation_special_requests` |

## Stays vs flights (parity)

| Concern | Flights | Stays |
|---------|---------|-------|
| Config gate | `isDuffelConfigured()` | Same (`DUFFEL_API_KEY`) |
| BFF prefix | `/api/v1/flights/*` | `/api/v1/stays/*` |
| Rate limit | IP / user on search | Same pattern on search |
| Auth | Bookings require user + permission | Bookings require `bookings:create` |
| Idempotency | `Idempotency-Key` on checkout | Same on `POST .../stays/bookings` |
| Webhooks | `order.*` | `stays.booking.created`, `stays.booking.cancelled`, `stays.booking_creation_failed` |

## Webhooks to subscribe (dashboard)

- `stays.booking.created`
- `stays.booking.cancelled`
- `stays.booking_creation_failed`
- Keep existing flight events on the same endpoint if used.

## Product notes

- **Room selection** maps to Duffel **rates** (`rate_id`), not arbitrary SKU quantities.
- **Multi-room** search sets `rooms` at search time; booking uses lead guest + optional extra names per Duffel guidance.
- **Trip / packages** (flight + hotel) remain out of scope for this vertical slice; link in DB can be added later.

---

## E2E smoke (test mode)

1. Set `DUFFEL_API_KEY` (Stays-enabled test token).
2. Home or `/hotels`: featured strip calls `GET /api/v1/stays/featured` (may be empty if sandbox has no inventory).
3. `/hotels`: pick destination with coords in `src/data/stay-destination-coords.ts`, dates, **Search** → list from `POST /api/v1/stays/search`.
4. Open a property → rates from `GET /api/v1/stays/search_results/{id}/rates` → select room → `POST /api/v1/stays/quotes` → **Proceed to payment** → `POST /api/v1/stays/bookings` on `/hotels/payment?quote_id=…` (Duffel balance; signed-in user with `bookings:create`).
5. Run `npx prisma migrate deploy` so `hotel_bookings` Duffel columns exist.
