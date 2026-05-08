# Duffel API Endpoint Mapping

**Project:** TravelTourUp  
**Document Version:** 1.0  
**Last Updated:** March 2025

---

## 1. Data Flow Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Next.js    │────▶│  PHP API     │────▶│  Duffel     │────▶│  PHP API     │────▶│  Next.js    │
│  Frontend   │     │  Backend     │     │  API        │     │  Backend     │     │  Frontend   │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘     └─────────────┘
```

---

## 2. Backend Endpoints That Wrap Duffel

### 2.1 Flight Search

| Our Endpoint | Method | Duffel API | Flow |
|--------------|--------|------------|------|
| `POST /v1/flights/search` | POST | `POST /air/offer_requests` | Next.js → PHP → Duffel → PHP formats → Next.js |

**Request (Next.js → PHP):**
```json
{
  "origin": "LHE",
  "destination": "JED",
  "departure_date": "2025-04-17",
  "return_date": null,
  "adults": 2,
  "children": 0,
  "infants": 0,
  "cabin_class": "economy",
  "trip_type": "one_way"
}
```

**PHP → Duffel:**
```json
POST https://api.duffel.com/air/offer_requests
{
  "data": {
    "slices": [...],
    "passengers": [...],
    "cabin_class": "economy",
    "live_mode": false
  }
}
```

**Response (PHP → Next.js):**

```json
{
  "success": true,
  "data": [
    {
      "offer_id": "off_xxx",
      "segments": [...],
      "total_amount": 450.00,
      "currency": "USD",
      "duration": "3h 15m",
      "stops": 0
    }
  ]
}
```

---

### 2.2 Create Hold Order

| Our Endpoint | Method | Duffel API | Flow |
|--------------|--------|------------|------|
| `POST /v1/flights/hold` | POST | `POST /air/orders` (type: hold) | Next.js → PHP → Duffel → PHP saves booking → Next.js |

**Request (Next.js → PHP):**
```json
{
  "offer_id": "off_xxx",
  "passengers": [
    {
      "title": "mr",
      "given_name": "John",
      "family_name": "Doe",
      "born_on": "1990-01-15"
    }
  ]
}
```

**PHP → Duffel:**
```json
POST https://api.duffel.com/air/orders
{
  "data": {
    "selected_offers": ["off_xxx"],
    "passengers": [...],
    "type": "hold"
  }
}
```

**Response (PHP → Next.js):**
```json
{
  "success": true,
  "data": {
    "order_id": "ord_xxx",
    "booking_ref_no": "20250318120000",
    "expires_at": "2025-03-18T12:30:00Z"
  }
}
```

---

### 2.3 Get Payment Intent (for Card Payment)

| Our Endpoint | Method | Duffel API | Flow |
|--------------|--------|------------|------|
| `POST /v1/flights/payment-intent` | POST | `POST /payments/payment_intents` | Next.js → PHP → Duffel → PHP returns client_token → Next.js |

**Request (Next.js → PHP):**
```json
{
  "order_id": "ord_xxx",
  "amount": "450.00",
  "currency": "USD"
}
```

**PHP → Duffel:**
```json
POST https://api.duffel.com/payments/payment_intents
{
  "data": {
    "amount": "450.00",
    "currency": "USD"
  }
}
```

**Response (PHP → Next.js):**
```json
{
  "success": true,
  "data": {
    "payment_intent_id": "pit_xxx",
    "client_token": "xxx"
  }
}
```

---

### 2.4 Check Payment (Replace phptravels.com)

| Our Endpoint | Method | Duffel API | Flow |
|--------------|--------|------------|------|
| `POST /v1/flights/duffel-check-payment` | POST | `GET /payments/payment_intents/:id` | Next.js → PHP → Duffel → PHP updates booking → Next.js |

**Request (Next.js → PHP):**
```json
{
  "payment_intent_id": "pit_xxx",
  "booking_ref_no": "20250318120000"
}
```

**PHP → Duffel:**
```
GET https://api.duffel.com/payments/payment_intents/pit_xxx
```

**Response (PHP → Next.js):**
```json
{
  "success": true,
  "data": {
    "status": "succeeded",
    "booking_ref_no": "20250318120000",
    "pnr": "ABC123"
  }
}
```

---

### 2.5 Pay for Hold Order (Confirm Booking)

| Our Endpoint | Method | Duffel API | Flow |
|--------------|--------|------------|------|
| `POST /v1/flights/pay` | POST | `PATCH /air/orders/:id` (with payment) | Next.js → PHP → Duffel → PHP updates booking → Next.js |

**Request (Next.js → PHP):**
```json
{
  "order_id": "ord_xxx",
  "payment_intent_id": "pit_xxx",
  "booking_ref_no": "20250318120000"
}
```

**PHP → Duffel:**
```
PATCH https://api.duffel.com/air/orders/ord_xxx
{
  "data": {
    "payment": {
      "type": "balance",
      "amount": "450.00",
      "currency": "USD"
    }
  }
}
```

Or use Payment Intent confirmation per Duffel docs.

---

### 2.6 Instant Booking (No Hold)

| Our Endpoint | Method | Duffel API | Flow |
|--------------|--------|------------|------|
| `POST /v1/flights/book` | POST | `POST /air/orders` (type: instant) | Next.js → PHP → Duffel → PHP saves booking → Next.js |

**PHP → Duffel:**
```json
POST https://api.duffel.com/air/orders
{
  "data": {
    "selected_offers": ["off_xxx"],
    "passengers": [...],
    "payments": [...],
    "type": "instant"
  }
}
```

---

### 2.7 Cancellation Quote

| Our Endpoint | Method | Duffel API | Flow |
|--------------|--------|------------|------|
| `POST /v1/flights/cancellation-quote` | POST | `POST /air/order_cancellations` | Next.js → PHP → Duffel → Next.js |

**PHP → Duffel:**
```json
POST https://api.duffel.com/air/order_cancellations
{
  "data": {
    "order_id": "ord_xxx"
  }
}
```

---

### 2.8 Confirm Cancellation

| Our Endpoint | Method | Duffel API | Flow |
|--------------|--------|------------|------|
| `POST /v1/flights/cancel` | POST | `POST /air/order_cancellations/:id` (confirm) | Next.js → PHP → Duffel → PHP updates booking → Next.js |

---

## 3. Endpoint Summary Table

| Our Endpoint | Duffel Endpoint | Purpose |
|--------------|-----------------|---------|
| `POST /v1/flights/search` | `POST /air/offer_requests` | Search flights |
| `GET /v1/flights/offer/:id` | `GET /air/offers/:id` | Get offer details |
| `POST /v1/flights/hold` | `POST /air/orders` (hold) | Create hold |
| `POST /v1/flights/book` | `POST /air/orders` (instant) | Instant book |
| `POST /v1/flights/payment-intent` | `POST /payments/payment_intents` | Get client token |
| `POST /v1/flights/duffel-check-payment` | `GET /payments/payment_intents/:id` | Check payment status |
| `POST /v1/flights/pay` | `PATCH /air/orders/:id` | Pay for hold |
| `POST /v1/flights/cancellation-quote` | `POST /air/order_cancellations` | Get refund quote |
| `POST /v1/flights/cancel` | `POST /air/order_cancellations/:id` (confirm) | Confirm cancel |

---

## 4. Webhook Handler

| Our Endpoint | Duffel Sends | Purpose |
|--------------|---------------|---------|
| `POST /api/webhooks/duffel` | `order.updated`, `payment_intent.succeeded` | Sync order status |

**Flow:** Duffel → PHP → Verify signature → Update `flights_bookings` → Return 200.
