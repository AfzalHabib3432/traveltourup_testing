# Duffel Enterprise Integration roadmap

**Project:** TravelTourUp (`traveltourup_next`)  
**Document version:** 1.1  
**Last updated:** April 2026  

**Companion:** [DUFFEL_ENTERPRISE_IMPLEMENTATION_PLAN.md](./DUFFEL_ENTERPRISE_IMPLEMENTATION_PLAN.md) — **§0** (payment model, revenue, scope, payment-without-ticket) and **§1.6** (`app/(booking)`).

**Meeting docs:** [DUFFEL_ENTERPRISE_MEETING_BRIEF.md](./DUFFEL_ENTERPRISE_MEETING_BRIEF.md), [DUFFEL_MEETING_AGENDA_AND_QUESTIONS.md](./DUFFEL_MEETING_AGENDA_AND_QUESTIONS.md).

---

## Purpose

This roadmap is a **realistic** schedule for implementing production-grade Duffel Flights integration, assuming **1–2 developers**, **Cursor-assisted** development, an existing **mock-first frontend**, and **~25–35% buffer** already baked into phase lengths for airline edge cases, payment (3DS), and QA.

**Duffel call prep:** Public-doc-backed answers to payment flow, markup, and failure handling are in [DUFFEL_ENTERPRISE_IMPLEMENTATION_PLAN.md](./DUFFEL_ENTERPRISE_IMPLEMENTATION_PLAN.md) **§0** — still **validate MOR, settlement, and enterprise terms** with Duffel.

**Not included in estimates:** legal/compliance review, commercial contract with Duffel, app store releases.

---

## Assumptions


| Assumption       | Detail                                                                                                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Team size        | 1 FTE-equivalent to 2 developers with overlap                                                                                                                    |
| Tooling          | Cursor AI for codegen/review; human owns architecture and merges                                                                                                 |
| Frontend         | `**[app/(booking)](../../app/(booking)`)** flight (and hotel/car) pages keep **same UI**; replace mocks with `/api/v1` + `src/lib/http/flights.ts` per blueprint |
| Backend          | Next.js `/api/v1` + Prisma + existing auth/RBAC                                                                                                                  |
| Credentials      | Test API initially; live keys only after UAT — **rotate any leaked keys**; never commit secrets                                                                  |
| Stays / packages | Phase P6; can start after P2 or in parallel if a second dev is free                                                                                              |


---

## Phase overview


| Phase | Calendar span (buffered)     | Theme                                                         |
| ----- | ---------------------------- | ------------------------------------------------------------- |
| P0    | 1–2 weeks                    | Foundation — clients, errors, webhooks, Prisma, DTOs          |
| P1    | 2–3 weeks                    | Search MVP — offer request, refresh, filters, UI hookup       |
| P2    | 4–6 weeks                    | Book & pay — checkout, order, payment intents, reconciliation |
| P3    | 2–3 weeks                    | Post-book — cancel/refund, webhooks production, ops fields    |
| P4    | 3–5 weeks                    | Ancillaries — seats, baggage, failure policies                |
| P5    | 2–3 weeks                    | Hardening — rate limits, observability, runbooks              |
| P6    | 8–12+ weeks (parallelizable) | Stays, trips, packages v1 — secondary                         |


**Rough total (P0–P5) to “production-ready flights”:** **16–24 weeks** at one effective full-time developer. With **two developers** splitting foundation + search vs booking + payments, wall-clock often **~10–14 weeks**, assuming scope does not expand.

---

## P0 — Duffel platform foundation (weeks 1–2)

### Goals

- All later phases reuse one **Duffel integration layer** and **error model**.
- Database ready for orders, passengers, payments, webhooks.
- No user-facing booking yet beyond health/smoke.

### Deliverables


| #    | Deliverable                                                                              | Done when                                                                   |
| ---- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| P0.1 | Env validation + config module                                                           | Invalid deploy fails fast; docs list vars                                   |
| P0.2 | `DuffelApiError` + mapping from Duffel `errors[]`                                        | Services catch and map to HTTP codes                                        |
| P0.3 | Split `src/lib/duffel/*` modules                                                         | offer_requests, offers, orders (stubs OK), client with timeout/retry policy |
| P0.4 | `POST /api/v1/webhooks/duffel` + signature verify                                        | 401 on bad signature; 200 on duplicate event                                |
| P0.5 | Prisma migration: `FlightBooking` columns + `DuffelWebhookEvent` + `FlightSearchSession` | Migrate dev + staging                                                       |
| P0.6 | `FlightOfferDTO` mapper + unit tests                                                     | Fixture JSON → stable DTO                                                   |
| P0.7 | CI: test env secret placeholder; optional nightly Duffel smoke                           | Pipeline green                                                              |


### Weekly checkpoints

- **End W1:** Client + errors + first successful `createOfferRequest` from server script or test.
- **End W2:** Webhook receives test event; idempotency table works.
- **End W3:** Prisma migrated; DTO mapper reviewed.
- **End W4:** P0 sign-off checklist complete; foundation doc updated if patterns changed.

### Risks


| Risk                            | Mitigation                                         |
| ------------------------------- | -------------------------------------------------- |
| Webhook signature docs mismatch | Test with Duffel dashboard “send test event” early |
| Prisma migration on prod        | Rehearse on Supabase branch DB first               |


---

## P1 — Flight search MVP (weeks 5–7)

### Goals

- Replace mock search with real **offer request** + **normalized list**.
- **GET offer** refresh endpoint ready for checkout handoff.

### Deliverables


| #    | Deliverable                                                 | Done when                                      |
| ---- | ----------------------------------------------------------- | ---------------------------------------------- |
| P1.1 | `POST /api/v1/flights/search`                               | Zod body; returns `search_session_id` + offers |
| P1.2 | `GET /api/v1/flights/offers/:offer_id`                      | Fresh price; maps `OFFER_UNAVAILABLE`          |
| P1.3 | Server-side filter/sort query params                        | Documented; tested                             |
| P1.4 | Optional batch offer requests                               | Behind flag if needed for UX                   |
| P1.5 | `**app/(booking)/flights/*`** wired to APIs (list + detail) | Same layouts/components; DTOs from backend     |
| P1.6 | `src/lib/http/flights.ts` + `flightKeys`                    | Mock imports removed from flight search path   |
| P1.7 | Rate limit anonymous search                                 | Basic protection                               |


### Weekly checkpoints

- **End W5:** Search returns real offers in UI (test mode).
- **End W6:** Offer detail/refresh stable; expiration surfaced.
- **End W7:** P1 QA: multi-slice (round-trip) path tested.

### Risks


| Risk                           | Mitigation                                |
| ------------------------------ | ----------------------------------------- |
| Huge offer payloads on mobile  | Server-side trimming; max offers returned |
| City vs airport code confusion | Normalize + document supported codes      |


---

## P2 — Book and pay (weeks 8–13)

### Goals

- **End-to-end book** with payment path aligned to Duffel card guide **or** balance (per ADR).
- **Idempotent** book; reconcile **orphan orders**.

### Deliverables


| #    | Deliverable                                                                                                                                                                                                                                        | Done when                                  |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| P2.1 | Checkout validation (passengers vs offer passenger ids)                                                                                                                                                                                            | Zod + integration tests                    |
| P2.2 | `POST /api/v1/flights/bookings`                                                                                                                                                                                                                    | Creates Duffel order + local `Booking`     |
| P2.3 | Payment Intents + Duffel **Card Payment** on `**[flights/payment](../../app/(booking)`/flights/payment/page.tsx)** (web); confirm intent → order with `balance` ([Duffel guide](https://duffel.com/docs/guides/collecting-customer-card-payments)) | E2E in test                                |
| P2.4 | **Payment confirmed / order failed** runbook + `BOOKING_FAILED_AFTER_PAYMENT` (plan §0.4)                                                                                                                                                          | Auto-retry / refund / ops queue documented |
| P2.5 | `PRICE_CHANGED` + tolerance UX                                                                                                                                                                                                                     | Documented cents threshold                 |
| P2.6 | `GET /api/v1/bookings` includes flight Duffel fields                                                                                                                                                                                               | Mobile parity                              |
| P2.7 | Reconciliation job or manual runbook                                                                                                                                                                                                               | Documented                                 |
| P2.8 | Idempotency key end-to-end                                                                                                                                                                                                                         | DB constraint + tests                      |


### Weekly checkpoints

- **End W8:** Passenger mapping correct for 2 adults + infant fixture.
- **End W10:** Happy path order + PNR in test.
- **End W11:** Payment failure paths return `PAYMENT_FAILED`.
- **End W13:** P2 UAT sign-off; ADR finalized (hold vs instant, PSP).

### Risks


| Risk                      | Mitigation                                    |
| ------------------------- | --------------------------------------------- |
| 3DS / SCA failures        | Retry UX; clear “payment not completed” state |
| Double booking on timeout | Idempotency + `GET order` reconciliation      |
| beta payments API drift   | Pin Duffel doc version; monitor changelog     |


---

## P3 — Post-booking: cancel, refund, webhooks (weeks 14–16)

### Goals

- Production webhook processing drives **status** and **support visibility**.
- **Cancellation** quote → confirm.

### Deliverables


| #    | Deliverable                                | Done when                     |
| ---- | ------------------------------------------ | ----------------------------- |
| P3.1 | `POST /api/v1/flights/bookings/:id/cancel` | Quote + confirm               |
| P3.2 | `OrderCancellation` + refund fields        | Admin or user UI reads status |
| P3.3 | Webhook handlers for order/payment events  | Idempotent; metrics           |
| P3.4 | Booking state machine documented           | Diagram in repo or z-docs     |


### Weekly checkpoints

- **End W14:** Cancel quote in test env.
- **End W15:** Webhook → DB status update proven.
- **End W16:** P3 regression pack passes.

### Risks


| Risk                 | Mitigation                             |
| -------------------- | -------------------------------------- |
| Non-refundable fares | Surface Duffel quote messaging clearly |
| Webhook delays       | Polling fallback for critical screens  |


---

## P4 — Ancillaries (weeks 17–21)

### Goals

- **Seat maps** and **baggage** (and meals if in scope) with clear failure modes.

### Deliverables


| #    | Deliverable                          | Done when                          |
| ---- | ------------------------------------ | ---------------------------------- |
| P4.1 | Seat map fetch + UI                  | Per segment/passenger              |
| P4.2 | Integrate selections into order flow | Matches Duffel create/update order |
| P4.3 | `BookingAncillary` persistence       | Reporting + support                |
| P4.4 | `ANCILLARY_PARTIAL_FAILURE` policy   | Product sign-off                   |


### Weekly checkpoints

- **End W17:** Seat map renders for 2 carriers in test.
- **End W19:** E2E with ancillary on one test airline.
- **End W21:** P4 polish + accessibility check on seat UI.

### Risks


| Risk                         | Mitigation                                         |
| ---------------------------- | -------------------------------------------------- |
| Airline-specific seat quirks | Feature-flag per route; fallback “contact support” |
| Order change API vs create   | Read Duffel “changing an order” before coding      |


---

## P5 — Hardening (weeks 22–24)

### Goals

- **Production readiness:** limits, monitoring, runbooks, security pass.

### Deliverables


| #    | Deliverable                  | Done when                                     |
| ---- | ---------------------------- | --------------------------------------------- |
| P5.1 | Rate limits tuned            | Documented thresholds                         |
| P5.2 | Structured logs + dashboards | Request id traceable                          |
| P5.3 | Runbooks                     | Webhook replay, stuck booking, refund stuck   |
| P5.4 | Security review              | No key in client; webhook verify; PII logging |
| P5.5 | Load smoke                   | Expected concurrent search/book               |


### Exit criteria

- Live Duffel key in prod secrets only; test in staging first  
- On-call knows runbook locations  
- Error codes documented for mobile team

---

## P6 — Secondary: Stays, trips, packages (weeks 25+)

**Implementation tracker:** [DUFFEL_STAYS_API_NOTES.md](./DUFFEL_STAYS_API_NOTES.md) (contracts, webhooks, smoke checklist) and BFF routes under `app/api/v1/stays/`.

### Goals (overview)

- Duffel **Stays** where it fits product strategy.
- **Trip** aggregate linking flight + hotel bookings.
- **Packages v1:** minimal bundling + pricing display (legal review).

### Suggested sequencing

1. Stays search/book in parallel module (`src/lib/duffel/stays.ts` already stubbed).
2. `Trip` table + API read model.
3. Package pricing rules internal; no need to block flight launch.

### Timeline

**8–12+ weeks** highly dependent on hotel UX and commercial model; treat as parallel track after P2 if resources allow.

---

## Risk register (cross-cutting)


| Risk                             | Impact            | Likelihood | Mitigation                                    |
| -------------------------------- | ----------------- | ---------- | --------------------------------------------- |
| Airline passenger / APIS rules   | Delay P2          | Medium     | Start with simple itineraries; expand fields  |
| International docs (passport)    | Delay ancillaries | Medium     | Phase gated by market                         |
| Schedule changes after book      | Support load      | High       | Webhooks + clear customer messaging           |
| PSP chargeback (custom payments) | Financial         | Low        | Prefer Duffel-native flow until mature        |
| Duffel API deprecation           | Technical         | Low        | Subscribe to changelog; pin integration tests |


---

## Definition of done (flights MVP)

- User can search, refresh offer, pay, and receive **confirmed** booking in **test** and **live** (live gated).
- Bookings visible in **web and mobile** via same APIs.
- Cancellations follow Duffel quote/confirm; states visible internally.
- Webhooks processed idempotently; manual runbook for failures.
- No API keys in client; secrets rotated if ever exposed.

---

*End of roadmap.*