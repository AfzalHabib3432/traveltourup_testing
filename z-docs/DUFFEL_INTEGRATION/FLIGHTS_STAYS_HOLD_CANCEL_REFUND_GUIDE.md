# Hold, cancel, exchanges & refunds — Duffel flights & stays (professional baseline)

This document defines **post-search lifecycle** operations for a **starting booking platform** using Duffel: **holds**, **cancellations**, **voluntary itinerary changes** (*industry “exchange” / date change*, not “round-trip return”), and **refunds** to travellers. It also covers **profile-side** presentation of **customer debits, credits, and refunds**. It is aligned with **Duffel’s official documentation** and records **what this repository implements today** versus **recommended next steps**.

**Companion guides:** [Flight payment flow](./FLIGHT_PAYMENT_FLOW_GUIDE.md) · [Stays payment flow](./STAYS_PAYMENT_FLOW_GUIDE.md) · [Keys & checkout ops](./DUFFEL_KEYS_AND_CHECKOUT.md).

---

## 0. Terminology (use consistently in product and support)

| Term | Meaning here |
|------|----------------|
| **Hold** | Duffel **air order** with `type: hold` — space reserved; payment completed before `payment_required_by` via **`POST /air/payments`** (not the round-trip “return” flight). |
| **Cancel** | **Flights:** `order_cancellations` quote → confirm. **Stays:** `POST /stays/bookings/{id}/actions/cancel` when allowed. |
| **Exchange / change** | **Flights:** Duffel **order change** flow (new slices / dates) — [Changing an order](https://duffel.com/docs/guides/changing-an-order). **Not** a round-trip leg unless you model it that way in the API. |
| **Refund (traveller)** | Money returned **to the guest’s card/wallet** via **your** process. Duffel often refunds **to your organisation** (e.g. **Duffel Balance**) first; you must **pass through** to the customer when you collected payment via **Duffel Payments** — see [Refunds (PaymentIntent)](https://duffel.com/docs/api/refunds/create-refund). |

---

## Part A — Flights

### A.1 Official references (Duffel)

| Topic | Guide / API |
|------|----------------|
| Pay later / hold | [Holding orders and paying later](https://duffel.com/docs/guides/holding-orders-and-paying-later) |
| Pay a hold | [Create a payment](https://duffel.com/docs/api/payments/create-payment) (`POST /air/payments` — **hold orders only**) |
| Cancel | [Cancelling an order](https://duffel.com/docs/guides/cancelling-an-order) |
| Order cancellations API | [Create order cancellation](https://duffel.com/docs/api/order-cancellations/create-order-cancellation) · [Confirm](https://duffel.com/docs/api/order-cancellations/confirm-order-cancellation) |
| Voluntary change | [Changing an order](https://duffel.com/docs/guides/changing-an-order) · [Order changes API](https://duffel.com/docs/api/order-changes/confirm-order-change) |
| Refund customer after PaymentIntent | [Create refund](https://duffel.com/docs/api/refunds/create-refund) |

---

### A.2 Hold orders — recommended lifecycle

**Purpose:** Let a traveller **commit** without immediate full settlement (where airline/Duffel allows), then **pay before the deadline**.

**Best-practice sequence:**

1. **Create hold** — `POST /air/orders` with `type: "hold"`, offer, passengers, optional services (same validation discipline as instant).
2. **Store** `order_id`, `payment_required_by`, and **latest** `total_amount` / `total_currency` from the order (or refresh with `GET /air/orders/:id` before paying).
3. **Before deadline** — `POST /air/payments` with `order_id` and `payment` object (`type`, `amount`, `currency`) matching the **current** order total.  
   - Duffel: if the price changed, you may get `price_changed` — refresh the order and retry with the new amount.
4. **After successful payment** — order becomes **ticketed/paid** per carrier state; sync `order_raw` and local **Booking** (`confirmed`, `paid`).

**Optimisation / safety:**

- **Always** refresh order before paying a hold (Duffel explicitly recommends minimising stale price risk).
- **Idempotency** on payment creation where supported; on `500` from pay, **contact Duffel support** before blind retry (Duffel documents this for hold payments).
- **Feature-flag** holds until your account supports them ([`FLIGHT_HOLD_BACKEND`](../../src/config/flight-hold.config.ts) pattern in this repo).

**Current codebase (TravelTourUp):**

- **Implemented:** Hold **creation** — `createDuffelHoldFlightBooking` in [`src/lib/services/flights/flights-booking.service.ts`](../../src/lib/services/flights/flights-booking.service.ts); gated by `FLIGHT_HOLD_BACKEND` / `NEXT_PUBLIC_FLIGHT_HOLD_BACKEND`; UI in [`FlightCheckoutDuffel`](../../src/components/flights/FlightCheckoutDuffel.tsx).
- **Gap (planning):** **Completing** hold payment via **`POST /air/payments`** (and linking **Duffel Payments** or **balance/card** per your account) is **not** present as a dedicated API route in this repo — treat as **required** if you productise “Pay later” beyond storing a pending booking.

---

### A.3 Cancellations — recommended lifecycle

Duffel uses a **two-step** cancellation for many orders:

1. **Quote** — `POST /air/order_cancellations` with `order_id` → pending **`ore_*`** with `refund_amount`, `refund_currency`, `refund_to`, quote `expires_at`.
2. **Confirm** — `POST /air/order_cancellations/{id}/actions/confirm` → order cancelled, refund applied per **`refund_to`** (e.g. **`balance`**, **`original_form_of_payment`**, **`airline_credits`**, etc.).

**Best practices:**

- Check **`available_actions`** on the order includes **`cancel`** before promising self-serve cancel ([Cancelling an order](https://duffel.com/docs/guides/cancelling-an-order)).
- **Respect quote expiry** — if expired, create a **new** cancellation quote (Duffel: only confirm the **most recent** quote).
- **`refund_amount` may be `0.00`** for non-refundable fares; **`null`** if unknown — handle in UX and ops.
- **Hold, unpaid:** refunds to traveller are **0** until paid; `refund_to` may be **`awaiting_payment`**-class semantics per Duffel.
- **After confirm:** refresh **`GET /air/orders/:id`** (or rely on webhook) and align local status.

**Pass-through refund to customer (Duffel Payments):**

Duffel states the refund goes to **your** original payment method (e.g. **balance**). If the **traveller** paid via **PaymentIntent**, you should **refund the customer** separately — use **[PaymentIntent refunds](https://duffel.com/docs/api/refunds/create-refund)** (and dashboard) per amount/currency rules.

**Airline credits:** If `refund_to` is **`airline_credits`**, operational handling differs (codes, passenger communication) — see Duffel’s cancellation guide.

**Current codebase:**

- **Implemented:** BFF `POST /api/v1/flights bookings/[id]/cancel` → [`processDuffelFlightBookingCancel`](../../src/lib/services/flights/flight-cancel.service.ts):  
  - `action: "quote"` → Duffel create cancellation, persist `flight_order_cancellations`, reuse non-expired pending quote.  
  - `action: "confirm"` + `order_cancellation_id` → confirm, update booking **`cancelled`**, **`payment_status`** `refunded` / `partially_refunded` from refund vs booking total.  
- **Webhooks:** [`applyDuffelWebhookEventSideEffects`](../../src/lib/services/duffel/duffel-webhook-handlers.ts) — on **`order.*`**, if order shows cancellation, sync parent booking to **`cancelled`** / **`refunded`** when not already cancelled.

**Optimisation ideas (roadmap):**

- Expose **`refund_to`** in customer-facing copy where legal/product allows.
- Admin tooling for **`airline_credits`** and **unknown** refund amounts.
- Correlate **`pit_*`** → **Duffel refund** → **your** `refund` records for audit.

---

### A.4 “Return” — voluntary order **change** (exchange), not hold payment

In airline retail, “return” often means **change dates or flights** (sometimes called **exchange**). On Duffel this is the **order change** product:

1. Create **order change request** (slices to remove / add).
2. Poll **order change request** for **offers**; show **`change_total_amount`**, penalties, new itinerary.
3. Create **pending order change** from chosen offer.
4. **Confirm** — if amount **> 0**, supply **payment**; if **negative**, refund to **`refund_to`**; then sync order.

**Current codebase:** **Not implemented** as a user-facing flow (no `order_changes` service in app routes). **Plan** as a phased feature with full quote UX and idempotent confirms.

---

### A.5 Refunds — layered model

| Layer | Responsibility |
|--------|----------------|
| **Airline / Duffel** | Cancellation or change determines **refund_amount** and **refund_to** on the **order** side. |
| **Your balance / card** | Money may land in **Duffel Balance** or original org payment rails. |
| **Traveller** | If they paid **PaymentIntent**, use **[Refunds API](https://duffel.com/docs/api/refunds/create-refund)** (or process from dashboard) for **customer** reimbursement; align timing and messaging with card networks (“5–10 business days” style copy from Duffel docs). |

**Void window:** Some orders expose **`void_window_ends_at`** — cancellation inside may behave like **full** void vs later **REFUNDED** with penalties; encode in business rules and display.

---

## Part B — Stays (hotels)

### B.1 Official references

| Topic | Guide / API |
|------|----------------|
| Key concepts (cancellation policy) | [Stays key concepts](https://duffel.com/docs/api/overview/stays-key-concepts) |
| Cancellation timeline UX | [Displaying the cancellation timeline](https://duffel.com/docs/guides/displaying-the-cancellation-timeline) |
| Cancel booking | Stays Bookings API — **Cancel** action (`POST /stays/bookings/{booking_id}/actions/cancel`); see [Duffel API — Bookings](https://duffel.com/docs/api/v2/bookings/create-booking) (cancel section in reference).
| Refund PaymentIntent to customer | [Create refund](https://duffel.com/docs/api/refunds/create-refund) |

---

### B.2 Cancellation & refund (stays)

**Flow:**

1. **Before offering cancel** — ensure the booking **supports** cancellation (Duffel booking / rate policy; **timeline** may show **non-refundable** after a date).
2. **Cancel** — `POST /stays/bookings/{booking_id}/actions/cancel` per API reference.
3. **Refund amount** — driven by **rate cancellation policy** (full / partial / none) and **when** the guest cancels relative to **check-in** — modelled in **`cancellation_timeline`** on rates; after cancel, inspect **updated booking** payload for settled amounts.
4. **Traveller refund** — if the guest paid via **Duffel Payments** (`pit_*`), use **[refunds](https://duffel.com/docs/api/refunds/create-refund)** toward **original_form_of_payment** as documented. If they paid only via **your** PSP elsewhere, refund **there**.

**No “hold” analogue:** Stays use **quotes** with **expiry** — optimise by **re-quoting** instead of long-lived unpaid holds.

**Current codebase:**

- **Implemented:** Webhooks — `stays.booking_creation_failed` sets booking **`failed`** / **`refund_pending`**; **`status === cancelled`** on payload sets **`cancelled`** / **`refunded`** ([`duffel-webhook-handlers.ts`](../../src/lib/services/duffel/duffel-webhook-handlers.ts)).
- **Gap:** No first-party **`POST /api/v1/stays/bookings/:id/cancel`** BFF in the grep-visible surface — **add** for parity with flights (authz, idempotency, error mapping), then call Duffel cancel.

---

### B.3 Exchanges / modifications (stays)

Property **changes** (dates, room) may be **cancel + rebook** or **PATCH** booking depending on Duffel API version and supplier — verify **[Update booking](https://duffel.com/docs/api/bookings/update-booking)** and product limits. Treat as **separate** from flight **order changes**; do not reuse flight change code.

---

## Part C — Cross-cutting best practices

### C.1 Webhooks (optimised sync)

- **Flights:** `order.created`, `order.updated`, cancellations embedded in order — already partially handled; keep **`order_raw`** authoritative for support.
- **Stays:** `stays.*` — keep **`stays_raw`** updated; use events for **failure** and **cancelled** as today.

**Rule:** HTTP **2xx** only when persistence succeeded; return **5xx** for transient DB errors so Duffel **retries** (your handler already leans this way).

### C.2 Idempotency & concurrency

- Use **idempotency keys** on **mutations** that create money movement (payments, booking creates).  
- **Cancellation confirm:** safe to protect with “already cancelled” checks (your flight service returns **409** when not pending).

### C.3 Support & audit

- Always log **Duffel ids**: `ord_*`, `ore_*`, `pit_*`, `bok_*`.
- Runbook: **payment succeeded, cancel failed** vs **cancel confirmed, refund API failed** — different actions.

### C.4 What “solid” means at starting scale

| Capability | Flights | Stays |
|------------|---------|--------|
| Hold create | Repo: yes (flagged) | N/A (quotes) |
| Hold **pay** | **Plan** (`/air/payments`) | N/A |
| Cancel | Repo: quote + confirm | **Plan** BFF + Duffel cancel |
| Voluntary **change** | **Plan** (order changes) | Per API / cancel+book |
| Customer **refund** after `pit_*` | **Plan** refunds API integration | Same when Stays use `pit_*` |
| Webhooks | Partial | Partial |
| **Profile money timeline** | Partial (status + cancel snippet) | Partial |

---

## Part D — Profile: logged-in customer — credits, debits, refunds

This section is the **product + data plan** for showing each customer **what they paid**, **what was returned**, and **what is pending** — without exposing internal Duffel settlement noise. It complements Duffel’s model where **supplier refunds often hit your org first** (e.g. balance), and **traveller refunds** may require a separate **PaymentIntent refund** step.

### D.1 Principles (professional / generic)

| Principle | Why |
|-----------|-----|
| **Traveller-visible ledger** | Show **charges** and **credits** the **guest** cares about (card / wallet), in **chronological** order, with **clear labels** (e.g. “Charged”, “Refund processing”, “Refunded”). |
| **Separate from supplier accounting** | Duffel **`refund_to`: `balance`** is **your** treasury; the profile should still show **customer outcome** once you initiate **`refunds`** toward **original_form_of_payment** when they paid via **`pit_*`**. |
| **One booking, many movements** | A single **Booking** can have: initial **capture**, **partial refund**, **order-change debit/credit**, **failed booking → refund pending** — model as **events**, not only `total_amount` + `payment_status`. |
| **References without leaking risk** | Show **last 4 / brand** or **masked** refs if you add them later; **support** can use full `pit_*` / `ref_*` / `ore_*` in admin tools. |
| **Honest pending states** | “Refund requested”, “Processing (5–10 business days)” matches [Duffel refund](https://duffel.com/docs/api/refunds/create-refund) expectations. |

### D.2 What to show (recommended line items)

Use **debit** / **credit** from the **customer’s** perspective:

| Direction | Typical sources (flights) | Typical sources (stays) |
|-----------|---------------------------|---------------------------|
| **Debit (charge)** | PaymentIntent **confirmed** amount (`guest_data.customer_charge` pattern today); future **hold completion** via `/air/payments`; **order change** if `change_total_amount > 0`. | Quote total charged (when customer pays at checkout); future `pit_*` parity with [STAYS_PAYMENT_FLOW_GUIDE](./STAYS_PAYMENT_FLOW_GUIDE.md). |
| **Credit (refund)** | Confirmed **cancellation** quote refund passed to customer via **`refunds`** API; **negative** order-change amount per **`refund_to`**. | After **cancel** action + policy; **PaymentIntent refund** when applicable. |
| **Other** | **Airline credits** (`refund_to: airline_credits`) — show as **non-cash** credit with instructions, not a card credit. | N/A or supplier-specific notes from **`stays_raw`**. |
| **Pending / failed** | **`BOOKING_FAILED_AFTER_PAYMENT`**, **`refund_pending`** — show **next step** or **contact support** with safe ref. | Webhook **`stays.booking_creation_failed`** → **`refund_pending`**. |

Optional **account-level** page: aggregate recent **events** across bookings (filter by date, type): faster support and aligns with bank “activity” lists.

### D.3 Data model (recommended direction)

Today, `Booking` carries **`total_amount`**, **`currency`**, **`payment_status`**, **`status`**, and **`guest_data` JSON** (flights include **`payment_intent_id`** and **`customer_charge`** in the success path). **Flight** cancellations are in **`flight_order_cancellations`** with **refund_amount** / **status**.

For a **solid** profile experience, plan one of:

1. **Append-only `booking_financial_events`** (preferred at scale): `booking_id`, `type` (`charge` | `refund` | `adjustment` | `payout_pending`), `amount`, `currency`, `status` (`completed` | `pending` | `failed`), `duffel_ref` (`pit_*`, `ref_*`, `ore_*`), `metadata` JSON, `created_at`.  
2. **Derive + cache** from Duffel webhooks + your API responses (lighter MVP) if you persist every **`payment_intent.succeeded`**, **`refund.succeeded`**, and cancellation confirms.

**Optimisation:** Never recalc purely from **`order_raw`** on the client; **server** builds the timeline from DB events + occasional **`GET`** refresh for disputes.

### D.4 Current codebase (TravelTourUp) — baseline

| Surface | What exists today | Gap vs recommended |
|---------|-------------------|---------------------|
| **[`BookingDetailView`](../../src/components/bookings/BookingDetailView.tsx)** | **`status`**, **`payment_status`**, **total**, flight **cancellation** lines (refund amount per stored `order_cancellations`), PNR / order ids | No **chronological ledger**, no **PaymentIntent** / **refund** line items, no **pending refund** detail copy |
| **List** | Booking list API (slim rows) | No **running balance** or **last activity** |
| **`guest_data` (flight)** | Includes **`payment_intent_id`**, **`customer_charge`** when booking is created from instant flow | Not surfaced as a **“Charged”** row in profile UI |
| **Stays** | Hotel section lacks refund / payment breakdown | Add after cancel BFF + optional `pit_*` |

### D.5 API / UX checklist (profile)

- [ ] **`GET /api/v1/bookings/:id`** (or child resource) returns **`financial_timeline[]`** built server-side from events (or v1: computed from booking + intents + cancellations + refunds table).
- [ ] **i18n** strings for: charged, refunded, partial refund, processing, airline credit, failed booking.
- [ ] **Permissions:** only **owner** (or `bookings:manage`) sees full timeline; same as booking detail today.
- [ ] **Link** to support with **`booking_ref_no`** + optional **`pit_*`** on sensitive failures only.
- [ ] When you implement **[Duffel refunds](https://duffel.com/docs/api/refunds/create-refund)**, persist **`ref_*`** and attach to the parent **booking** event.

---

## Part E — Implementation checklist (copy into tickets)

**Flights — hold**

- [ ] Account confirms **hold** eligibility.
- [ ] Implement **pay hold** path: refresh order → `POST /air/payments` → sync local booking state.
- [ ] Handle **`price_changed`**, **`past_payment_required_by_date`**, **`already_paid`** with clear UX.

**Flights — cancel (harden existing)**

- [ ] Surface **`available_actions`** in UI before showing cancel.
- [ ] Handle **`airline_credits`** and **null** refund in UX.
- [ ] Automate or script **PaymentIntent refunds** when `refund_to` is balance and guest paid card.

**Flights — change**

- [ ] MVP: link to **support** or Duffel dashboard; long-term: order change wizard + payment on confirm.

**Stays — cancel**

- [ ] Add **`POST /api/v1/stays/bookings/:id/cancel`** with authz + idempotency.
- [ ] Map Duffel errors to stable app codes; refresh `stays_raw` after cancel.

**Profile / timeline**

- [ ] Define **`booking_financial_events`** (or equivalent) and emit on: successful charge, refund created/succeeded, cancellation confirm, order change confirm.
- [ ] Extend booking detail API + [`BookingDetailView`](../../src/components/bookings/BookingDetailView.tsx) with **Payments & refunds** section (debits/credits, pending).
- [ ] Optional: **account** activity page aggregating cross-booking events.

---

*Duffel’s API and eligibility rules evolve — verify endpoint paths and enums against [duffel.com/docs](https://duffel.com/docs) before shipping. This guide reflects patterns documented by Duffel for hold payment, order cancellation, order change, stays cancellation, and PaymentIntent refunds.*
