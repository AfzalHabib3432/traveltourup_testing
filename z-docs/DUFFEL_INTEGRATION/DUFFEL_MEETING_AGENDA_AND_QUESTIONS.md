# the Duffel — meeting agenda and questions

**TravelTourUp** | Simple reference for your call  
**Companion doc:** [DUFFEL_ENTERPRISE_MEETING_BRIEF.md](./DUFFEL_ENTERPRISE_MEETING_BRIEF.md) (full context)

**Implementation plan (doc-backed draft answers):** [DUFFEL_ENTERPRISE_IMPLEMENTATION_PLAN.md](./DUFFEL_ENTERPRISE_IMPLEMENTATION_PLAN.md) **§0** — payment rails (Duffel Payments + Balance), markup in PaymentIntent amount, scope tiers, **payment succeeded / booking failed**, cancellation/refund roles. Confirm details on the call.

---

## Meeting details (fill in)


|                        |                         |
| ---------------------- | ----------------------- |
| Date / time            |                         |
| Timezone               |                         |
| Duration               | 45–60 min (recommended) |
| Duffel attendees       |                         |
| TravelTourUp attendees |                         |


---

## Opening (about 3 minutes)

- Thank them for their time (including LinkedIn connection if relevant).
- **One sentence:** TravelTourUp is building a Next.js website and mobile app for flights, hotels, and cars, with direct bookings and an agent-assisted channel. We want to understand **enterprise pricing**, **payment and booking flow**, and **what Duffel supports today** versus roadmap.

---

## Enterprise prerequisites (confirm with Duffel)

Duffel’s **exact** requirements depend on **market, entity, and products**. Treat the list below as **topics to clarify**; ask them for their **written go-live checklist**.


| Topic                 | Questions                                                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **IATA / ticketing**  | Is **IATA** accreditation (or a **regional equivalent**) **required** for our use case? If not now, **when** does it become mandatory? |
| **US / other rails**  | Do we need **ARC** or other **BSP** arrangements for any settlement path?                                                              |
| **Travel regulation** | Any Duffel requirements tied to **package travel**, **financial protection**, or **seller-of-travel** rules in our jurisdictions?      |
| **KYB / company**     | Company docs, **tax ID**, **UBO** verification, website with **terms, privacy, refunds**.                                              |
| **Payments**          | **KYC** for Duffel Payments; deposits or **credit limits** for enterprise.                                                             |
| **Security / legal**  | **DPA**, **MSA**, security questionnaire before live keys.                                                                             |
| **Agents**            | Extra requirements if we add an **agent-assisted** channel (single legal entity vs sub-agents).                                        |


---

## Agenda


| Block | Topic                                   | Time      |
| ----- | --------------------------------------- | --------- |
| 1     | Commercial: pricing, contract, support  | 10–15 min |
| 2     | Search and booking lifecycle            | 10 min    |
| 3     | Payments, cancellations, refunds        | 10 min    |
| 4     | Hotels, cars, packages (combined trips) | 8 min     |
| 5     | Agents, reporting, reconciliation       | 5–8 min   |
| 6     | Next steps, owners, materials           | 5 min     |


---

## 1. Commercial and account

- What is included in **enterprise** compared to self-serve?
- How is **pricing** structured: per booking, per passenger, tiers, minimums, overages?
- Are **payment processing costs** separate or included? Any currency or cross-border fees?
- **Payment terms:** invoicing, billing cycle, taxes on fees.
- **Support and SLA:** response times, escalation, status communications.
- **Legal:** MSA, DPA, subprocessors, security review process.
- What do we need to move from **test** to **live** API keys?

---

## 2. Search and booking lifecycle

- **Rate limits** at scale; how to request higher limits.
- **Multi-city, open-jaw,** and **mixed airlines** on outbound versus return: what does Duffel recommend (one offer versus separate bookings)?
- **Hold** versus **instant** booking: when to use each, hold duration, ticketing timing.
- Which **webhook events** should we treat as the source of truth for order status?
- **Offer expiry:** how often must we refresh or re-quote before payment?

---

## 3. Payments, cancellations, refunds

- Recommended **payment flow** with Duffel Payments (high-level steps).
- Whats the main payement flow when our customer book the flight and go to payment side (direct payment to duffel or payment goes to our account and than to duffel )
- **Merchant of record**, settlement timing, and **chargeback** handling.
- **3DS / SCA** and failed payments: recovery and idempotency.
- **Cancellations:** what can be done in the API; what is airline-dependent?
- **Refund** timing and fees (customer refund versus Duffel’s fees to us).
- **PCI** guidance for our integration pattern (what we must not store or log).

---

## 4. Hotels, cars, and packages

- **Stays:** maturity and coverage for our target markets.
- **Cars:** available through Duffel, partner-only, or not supported in our regions?
- For **flight + hotel** in one customer journey: does Duffel recommend **separate orders** under one checkout experience?
- Any constraints on **markups or service fees** we show to customers?

---

## 5. Agents and commissions

- **Our model:** B2C travelers plus an **agent-assisted** channel. Does Duffel need a specific label for onboarding (B2C platform with agents)?
- Does Duffel support **split payouts** to agents, or does settlement go to **one** TravelTourUp account only?
- **Agent commissions** we pay from our margin: confirm this is **our internal** settlement unless Duffel offers a dedicated program.
- **Reporting or exports** to reconcile bookings and fees (for operations and paying agents).

---

## 6. Close — next steps

- Who sends a **written proposal** or pricing sheet?
- **Technical** contact for implementation and webhooks.
- **Documents** to send: contract overview, rate limits, webhook catalog, go-live checklist.
- Date for a **follow-up** call if engineering should join.

---

## Quick checklist (all topics covered)

Use at the end of the call to confirm nothing major was missed.

- Enterprise pricing and fees  
- **Prerequisites (IATA, KYB, legal, security)** and test versus live requirements  
- Search limits and complex itineraries  
- Hold versus instant and webhooks  
- Payment flow, MOR, refunds  
- Stays, cars, combined journeys  
- Agent model and settlement  
- Named owners and follow-up materials

---

## After the call

- Send a **short thank-you email** within 24 hours: recap, open questions, requested documents.
- See **follow-up template** in [DUFFEL_ENTERPRISE_MEETING_BRIEF.md](./DUFFEL_ENTERPRISE_MEETING_BRIEF.md).

