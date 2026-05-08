---
name: Duffel flights UX phases
overview: Phase 0 establishes professional file/component structure. Later phases add Duffel-aligned search (dynamic airports, ages, advanced options, time windows), results filters/sort, enriched cards and round-trip selection UX, fare comparison tied to search cabin, checkout improvements (Pay now vs Hold behind a feature flag), auth-gated payment with return URL, and tighter integration with existing My Bookings—aligned with [Duffel Guides](https://duffel.com/docs) and common OTA patterns.
todos:
  - id: phase-0-extract
    content: "Phase 0: Extract FlightResultCard, FilterSidebar, sort controls from FlightList; optional FlightsTab hook splits; update imports only."
    status: pending
  - id: phase-1-search
    content: "Phase 1: Airports API proxy + Duffel-dashboard-style picker (type-to-filter, scroll, debounce, abort, caps); child ages in URL/body; advanced options + slice time windows + multi-city validation; align Duffel payload."
    status: pending
  - id: phase-2-filters
    content: "Phase 2: Duffel sort labels + duration_desc; stops radio; dynamic airlines select; flight number + time window filters on client."
    status: pending
  - id: phase-3-card
    content: "Phase 3: Logos/terminals/layovers in DTO + list display; expandable timeline FlightCard; fix trip-type pricing copy."
    status: pending
  - id: phase-4-roundtrip-fare
    content: "Phase 4: Round-trip cluster UX in results; FlightDetailContent fare cards + offer_id switch; booking details sync."
    status: pending
  - id: phase-5-checkout
    content: "Phase 5: Server auth gate on /flights/payment with next=; contact + passenger sections; Pay now vs Hold UI + feature-flagged hold API branch."
    status: pending
  - id: phase-6-mybookings
    content: "Phase 6: Enrich MyBookingsList/detail for flights from stored Duffel snapshot + status; post-seat/order sync as needed."
    status: pending
isProject: false
---

# Duffel flights: phased improvement plan

## Current baseline (what you already have)

- Search builds URL params → `[flightSearchBodyFromUrl](D:/traveltourup_latest_d/traveltourup_next/src/lib/flights/search-from-url.ts)` → POST `[/api/v1/flights/search](D:/traveltourup_latest_d/traveltourup_next/app/api/v1/flights/search/route.ts)` → `[runFlightSearch](D:/traveltourup_latest_d/traveltourup_next/src/lib/services/flights/flights-search.service.ts)` (Duffel offer request + server-side filter/sort + Prisma `flightSearchSession`).
- Results: `[FlightList.tsx](D:/traveltourup_latest_d/traveltourup_next/src/components/flights/FlightList.tsx)` maps offers via `[flightOfferToListDisplay](D:/traveltourup_latest_d/traveltourup_next/src/lib/flights/list-display.ts)`; cards use **carrier initials**, not logos; airline filter list is **hardcoded**.
- Detail: `[/flights/[id]](D:/traveltourup_latest_d/traveltourup_next/app/(booking)`/flights/[id]/page.tsx) loads a single offer by id; `[FlightDetailContent](D:/traveltourup_latest_d/traveltourup_next/src/components/flights/FlightDetailContent.tsx)` shows generic copy; **fare type is hardcoded “Economy”**.
- Checkout: `[FlightCheckoutDuffel](D:/traveltourup_latest_d/traveltourup_next/src/components/flights/FlightCheckoutDuffel.tsx)` + Duffel Payments; booking service creates `**type: "instant"`** orders with `**payments: [{ type: "balance", ... }]**` after PaymentIntent success (`[flights-booking.service.ts](D:/traveltourup_latest_d/traveltourup_next/src/lib/services/flights/flights-booking.service.ts)`).
- My bookings: `[/profile/bookings](D:/traveltourup_latest_d/traveltourup_next/app/(marketing)`/profile/bookings/page.tsx) + `[MyBookingsList](D:/traveltourup_latest_d/traveltourup_next/src/components/bookings/MyBookingsList)` with login redirect using `next` (same mechanism as `[login/page.tsx](D:/traveltourup_latest_d/traveltourup_next/app/(auth)`/login/page.tsx) + `[safeInternalPath](D:/traveltourup_latest_d/traveltourup_next/src/lib/auth/redirect.ts)`).

Your choice for **Hold order**: ship **full UI + persistence of choice**, wire **backend behind a feature flag** until Duffel/account confirms hold is enabled.

---

## Architecture note: why Duffel shows “DXB → NYC” then “NYC → DXB”

Duffel’s dashboard **round-trip** still uses **one offer request with two slices**; each **offer** normally contains **both slices** with a **single total price**. The “pick outbound, then return” pattern is a **UX decomposition**: cluster offers by the **outbound slice identity** (times, segments, carriers), let the user pick a cluster, then show **only offers in that cluster** so the user effectively chooses the **return slice** while always selecting a **full `offer_id`**. This matches how Booking.com-style sites narrow results without second API round-trips, and stays API-correct because checkout still uses one `**off_…**`.

**Fare “Economy Basic / Business Premium” rows** in the reference are usually **different offers** (different fare brands / cabin / rules) for the **same or similar operating itinerary**. Implementation approach:

- Extend `[FlightOfferDTO](D:/traveltourup_latest_d/traveltourup_next/src/lib/duffel/dto/flight-offer.dto.ts)` / mapper to retain **fare brand / cabin / conditions** fields present on Duffel slices/segments (per [Offer and Order Conditions](https://duffel.com/docs) guide).
- On the detail step, **group or list sibling offers** with the same itinerary fingerprint from the **stored search session** (you already persist `offer_request_id` on `[flightSearchSession](D:/traveltourup_latest_d/traveltourup_next/src/lib/services/flights/flights-search.service.ts)`). Add a small authenticated (or session-scoped) API such as `GET /api/v1/flights/search-sessions/:id/offers` that reloads offers for that `offer_request_id` **or** returns the last snapshot from DB—choose the approach that matches Duffel’s offer refresh/expiry rules and your rate limits.

```mermaid
flowchart LR
  search[Search offer_request] --> offers[All offers in memory or session]
  offers --> cluster[Cluster by slice0 fingerprint]
  cluster --> pickOut[User picks outbound cluster]
  pickOut --> pickRet[Show offers in cluster slice1 variants]
  pickRet --> offerId[User selects one offer_id]
  offerId --> detail[Fare cards / detail]
  detail --> checkout[Checkout Pay now or Hold UI]
```



---

## Phase 0 — Naming, extraction, and structure (do first)

**Goal:** Smaller, named components and hooks without changing behavior (mechanical refactors only).


| Area                                                                                                              | Direction                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[FlightList.tsx](D:/traveltourup_latest_d/traveltourup_next/src/components/flights/FlightList.tsx)` (~900 lines) | Extract `FlightResultCard`, `FlightResultsFilterSidebar`, `FlightResultsSort` (or `results/` subfolder). Keep a thin `FlightList` orchestrator.                                           |
| `[FlightsTab.tsx](D:/traveltourup_latest_d/traveltourup_next/src/components/flights/FlightsTab.tsx)`              | Extract hooks: `useFlightSearchUrl`, `useAirportField`, `useTravelerPicker` (prep for Phase 1). Optional rename to `FlightSearchTab` **if** all imports updated (views, admin).           |
| Types                                                                                                             | Move shared display types next to `[list-display.ts](D:/traveltourup_latest_d/traveltourup_next/src/lib/flights/list-display.ts)` or `types/flight-results.ts` to avoid circular imports. |


Avoid renaming public routes (`/flights`, `/flights/payment`).

---

## Phase 1 — Search tab: Duffel-aligned airports, travelers, advanced options, times, multi-city

**1. Dynamic airports (“Duffel dashboard style”)**

- Add server route e.g. `GET /api/v1/flights/airports?q=&iata=` proxying Duffel **Airports** (or **Places** if you standardize on area search per [Finding Airports within an Area](https://duffel.com/docs)) with IP/user rate limiting like search.
- **Match Duffel dashboard UX**: dropdown opens with a **“Type to filter”** search field (focused on open), **scrollable** results list (fixed max height + overflow), and **short initial suggestions** when the query is empty—same information hierarchy as Create order / airport pickers in the dashboard, not a free-text field with unbounded matches.
- **Match Duffel-style network behavior**: **debounce** input (~250–400ms), **minimum query length** before calling the API (e.g. 2–3 chars) except when pasting a full IATA code, **abort prior in-flight fetches** when the query changes (`AbortController`), and **cap returned rows** server-side (e.g. 15–25) so the panel stays fast—mirroring how the dashboard stays responsive without loading the full airport catalog.
- Retire reliance on static `[AIRPORTS](D:/traveltourup_latest_d/traveltourup_next/src/data/airports.ts)` for primary UX (keep as offline fallback if API fails).

**2. Child / infant ages**

- UI: Duffel-style stepper + per-child age selects with validation copy from your references.
- URL + API: extend query serialization in `[buildFlightsSearchUrl](D:/traveltourup_latest_d/traveltourup_next/src/components/flights/FlightsTab.tsx)` and parsing in `[flightSearchBodyFromUrl](D:/traveltourup_latest_d/traveltourup_next/src/lib/flights/search-from-url.ts)` (e.g. `child_ages=5,12` or compact JSON) so refresh/deep link preserves ages.
- `[passengersFromCounts](D:/traveltourup_latest_d/traveltourup_next/src/lib/flights/passengers.ts)` already supports explicit child ages via `[passengersToDuffelOfferRequest](D:/traveltourup_latest_d/traveltourup_next/src/lib/flights/passengers.ts)`; ensure `[flightSearchBodySchema](D:/traveltourup_latest_d/traveltourup_next/src/lib/validations/flights.schema.ts)` passengers align.

**3. Advanced options (Duffel-like)**

- Collapsible section: **preferred carriers** (multi-select with optional logo from search metadata), **max connections** (map to existing `max_connections` in `[runFlightSearch](D:/traveltourup_latest_d/traveltourup_next/src/lib/services/flights/flights-search.service.ts)`), **supplier timeout** only if you actually pass it to Duffel (today it is **not** in payload—either omit from UI or add explicit `supplier_timeout` support in offer request per API reference).
- Optional: loyalty accounts—only if you implement `[Adding Loyalty Programme Accounts](https://duffel.com/docs)`; otherwise skip to avoid dead fields.

**4. Take-off / landing time adjustment**

- Confirm exact Duffel `slices[]` fields (e.g. time windows) in API reference, then extend `[sliceSchema](D:/traveltourup_latest_d/traveltourup_next/src/lib/validations/flights.schema.ts)` + `[createOfferRequest` payload](D:/traveltourup_latest_d/traveltourup_next/src/lib/services/flights/flights-search.service.ts).
- UI: popovers under date fields (“At any time” → dual-handle range) matching your references; persist in URL where possible.

**5. Multi-city**

- Validate each leg (no duplicate empty slices), enforce Duffel slice ordering rules, clear errors, and reuse the same airport combobox component per leg.

Reference: [Search Best Practices](https://duffel.com/docs).

---

## Phase 2 — Results sidebar: Duffel sort, stops, airlines, flight time

**Sort (replace generic labels with Duffel copy)**

- Map UI labels **Least expensive / Most Expensive / Shortest duration / Longest duration** to sort ids.
- Extend `[flightSearchBodySchema.sort](D:/traveltourup_latest_d/traveltourup_next/src/lib/validations/flights.schema.ts)` and `[applyFiltersAndSort](D:/traveltourup_latest_d/traveltourup_next/src/lib/services/flights/flights-search.service.ts)` with `**duration_desc`** (today you only have `duration_asc`).
- Decide single source of truth: **client-only sort** (fast, no refetch) vs **re-run search with `sort` param** (matches server ordering). Recommend **client sort** on the loaded offer list for UX, keep URL `sort` in sync for shareable links.

**Stops**

- Replace checkbox placeholders with **Duffel-style radio**: Direct only / 1 stop at most / 2 stops at most / Any → `max_stops` or post-filter on `[stops_count](D:/traveltourup_latest_d/traveltourup_next/src/lib/duffel/dto/flight-offer.dto.ts)`.

**Airlines**

- Derive airline list from **current `flights` results** (IATA + name), with `<select>` or combobox; optionally enrich with logo URL once DTO carries it (Phase 3). Remove hardcoded `[airlines` array](D:/traveltourup_latest_d/traveltourup_next/src/components/flights/FlightList.tsx).

**Flight number + flight time**

- **Flight number**: client filter matching segment `flight_number` / marketing number on raw offer—may require storing a **minimal raw snippet** on each list row (extend `FlightListDisplay` or parallel map) or storing full DTO in session keyed by id (memory tradeoff).
- **Flight time**: dual sliders for dep/arr windows; filter client-side using segment `departing_at` / `arriving_at` ISO strings.

---

## Phase 3 — FlightCard + data model polish

- **Airline logo**: extend `[mapSegment](D:/traveltourup_latest_d/traveltourup_next/src/lib/duffel/dto/flight-offer.dto.ts)` / list display to include `logo_url` from Duffel carrier objects when present; fallback to monogram.
- **Terminals / layovers**: map from segment/airport objects if available in raw JSON (today list display hardcodes `"—"` for terminals in `[flightOfferToListDisplay](D:/traveltourup_latest_d/traveltourup_next/src/lib/flights/list-display.ts)`).
- **Expandable header**: clickable top region toggles **timeline** (departure/arrival datetime, airport names, duration row, cabin, baggage icons) like your reference—data from `FlightOfferDTO` slices/segments.
- **Copy fix**: remove incorrect **“round trip per traveler”** on every card when `trip` is one-way (derive from URL `trip` / slice count).

---

## Phase 4 — Round-trip flow + fare selection on detail

- **FlightList state machine**: if URL indicates `round_trip`, run **two-step selection** inside list (breadcrumbs: e.g. Outbound → Return), narrowing offers as described above; only navigate to `/flights/[offerId]` after final offer pick (Booking.com-style progressive disclosure).
- `**FlightDetailContent`**: show **fare option cards** for the selected itinerary fingerprint (sibling offers); default highlight = cabin from FlightsTab / URL `cabin_class`; changing fare switches `**offer_id`** (link, checkout, sidebar, session storage).
- `**BookingSidebar` / booking details**: read chosen fare name, price, baggage/conditions from DTO, not static text.

Ensure **offer expiry** handling: if user swaps fare, refresh offer via existing `[getFlightOffer](D:/traveltourup_latest_d/traveltourup_next/src/lib/http/flights.client.ts)`.

---

## Phase 5 — Checkout: contact, passengers, Pay now vs Hold (flagged)

- **Auth gate**: In `[app/(booking)/flights/payment/page.tsx](D:/traveltourup_latest_d/traveltourup_next/app/(booking)`/flights/payment/page.tsx), use `getServerAuthz()` + `redirect` to `/login?next=` with **full path + query** (wrapped with `safeInternalPath` / encodeURI) so post-login returns to the same offer checkout—mirror `[profile/bookings/page.tsx](D:/traveltourup_latest_d/traveltourup_next/app/(marketing)`/profile/bookings/page.tsx).
- **Contact block**: single section for email/phone (Duffel `orders` contact vs per-passenger fields—follow your current Zod schema and Duffel requirements).
- **Passenger UI**: group **Personal** vs **Passport** (where required), match `[flightCheckoutPassengerSchema](D:/traveltourup_latest_d/traveltourup_next/src/lib/validations/flight-checkout.schema.ts)`; align labels with Duffel dashboard copy while keeping your visual system.
- **Pay now vs Hold order**:
  - **UI**: radio cards + helper text mirroring Duffel.
  - **State**: persist choice in `sessionStorage` with checkout draft.
  - **Backend (feature flag ON later)**: new branch for `type: "hold"` order creation and delayed capture per [Holding Orders and Paying Later](https://duffel.com/docs); until flag ON, show clear message or disable Hold with “coming soon” per product preference.
- **Pay now path**: keep [Getting An Accurate Price Before Booking](https://duffel.com/docs) behavior (you already refresh offer in booking service).

---

## Phase 6 — My booking polish post-ticket/seat

- Reuse `[MyBookingsList](D:/traveltourup_latest_d/traveltourup_next/src/components/bookings/MyBookingsList)` / detail views; ensure **flight** rows show Duffel PNR, status, and deep link to itinerary snapshot you store in `itinerary_snapshot`.
- Post–seat selection: confirm order sync (webhooks or poll) if you add **manage** flows later ([Changing an Order](https://duffel.com/docs), [Adding Seats](https://duffel.com/docs)).

---

## Risk / scope controls

- **Hold + Duffel Payments**: product clarification already handled via feature flag.
- **Fare siblings**: depends on retrieving multiple offers per `offer_request_id`; if Duffel prunes expired offers aggressively, fallback message + re-search.
- **Performance (Duffel dashboard parity, not generic “optimize later”)**:
  - **Airports**: same interaction model as the dashboard—type-to-filter inside the dropdown, scrollable list, debounce + min query length + abort stale requests + capped API page size (see Phase 1). Avoid rendering thousands of DOM nodes; rely on **server-trimmed results**, not client-side filtering of a full dump.
  - **Flight results**: Duffel returns a bounded set per offer request (`limit`already capped in `[flightSearchBodySchema](D:/traveltourup_latest_d/traveltourup_next/src/lib/validations/flights.schema.ts)`). **Client**: `useMemo` for derived filter/sort lists; **pagination** (already paginated in `FlightList`) matches dashboard-style “work through a manageable page” rather than mounting hundreds of heavy cards at once. Add **windowing / virtualization** only if you raise limits or add infinite scroll—default is dashboard-like **page size + scroll within page**.

---

## Documentation

- Track parity decisions in your internal doc (not new user-facing markdown unless you ask): link relevant [Duffel Guides](https://duffel.com/docs) sections per feature (search, hold, conditions, seats, bags).

