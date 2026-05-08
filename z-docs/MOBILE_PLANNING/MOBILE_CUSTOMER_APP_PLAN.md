# Customer mobile app — planning document

This plan assumes **reuse of the existing Next.js backend**: same Supabase Auth, same `/api/v1/*` routes, and the same Duffel-integrated flows for flights (and existing patterns for stays/cars). **No admin module** on mobile.

---

## 1. Stack selection

**Primary choice: React Native (Expo)**

| Factor | Rationale |
|--------|-----------|
| Skill fit | You standardize on MERN + React Native; fastest path to production. |
| API parity | Mobile is a thin client over REST; no need for native-only flight stacks. |
| Auth | Supabase JS + `expo-secure-store` is well documented for session refresh. |
| OTA updates | Expo EAS Update supports critical fixes without full store review (within policy). |

**When to reconsider**

- **Heavy offline-first** (full itinerary offline, conflict resolution): consider SQLite + sync layer, or cap scope to “offline read cached bookings only.”
- **Team forbids Expo**: bare React Native CLI is viable; same architecture below, more native tooling cost.

**Not recommended as default here**: Flutter (duplicate UI/auth work), PWA-only (weaker push/storage patterns for booking apps).

**Recommendation:** **Expo (SDK current LTS) + TypeScript + Expo Router** for navigation and deep links.

---

## 2. Architecture and design

- **Layers**
  - **UI** — screens, reusable components, theme tokens.
  - **Features** — flights, hotels, cars, bookings (each owns hooks + screens + types).
  - **Core** — `api` (fetch wrapper), `auth` (session), `config` (env), `query` (TanStack Query client), `storage` (secure + async prefs).
- **Principles**
  - Feature folders, **no circular imports**; shared UI only from `components/`.
  - **DTOs** aligned with web: either share OpenAPI-generated types later, or mirror `src/lib/http/*.client.ts` response shapes manually in `packages/shared-types` (optional monorepo step).

---

## 3. Authentication (Supabase)

- **Storage:** `expo-secure-store` for refresh token / sensitive session material; avoid AsyncStorage for secrets.
- **Flow:** Email/password or magic link — mirror web; use `@supabase/supabase-js` with `react-native-url-polyfill` if needed.
- **API calls:** Cookie-based web sessions do not apply on mobile; use **Bearer access token** from Supabase on `Authorization` header for `fetch` to your API **if** the backend accepts JWT validation (confirm your Next routes use the same verifier as web). If the web app is cookie-only today, add a **mobile-friendly auth path** (e.g. `Authorization: Bearer <access_token>`) in API middleware — plan this as **P0** before shipping mobile.
- **Refresh:** Centralize in `auth/session.ts`; 401 → refresh once → retry; on failure → logout + login screen.

---

## 4. API integration

- **Base URL:** `EXPO_PUBLIC_API_URL` (e.g. `https://your-domain.com`).
- **Generic client:** `apiJson(path, { method, body, headers })` matching web’s error shape (`code`, `message`).
- **Retries:** Idempotent GETs retry 1–2 times with backoff; POSTs (booking) **no** blind retry — use idempotency keys where the API supports them (flight bookings already use `Idempotency-Key`).
- **Timeouts:** 30s default for search; shorter for health.

---

## 5. Modules (customer scope)

| Module | Screens (MVP) | APIs (examples) |
|--------|----------------|-----------------|
| Flights | Search, results, detail, checkout/payment entry | `/api/v1/flights/search`, offers, payment-intents, bookings |
| Hotels | Search/list, detail, quote flow as per web | stays routes as in web client |
| Cars | List, detail, booking | existing car endpoints |
| Booking | Shared confirmation, failure states | booking detail by id |
| My bookings | List, detail, status | `/api/v1/bookings`, `/api/v1/bookings/:id` |

**Demo foundation:** Implement **auth + My Bookings + one vertical** (flights OR hotels) end-to-end first; add cars second; deepen filters last.

---

## 6. State management

- **TanStack Query (React Query):** server state — searches, offers, booking detail, paginated lists. Cache keys mirror URL/body fingerprints (same idea as `flightKeys` on web).
- **Zustand (light):** UI ephemera — last search form draft, optional non-persisted wizard step.
- **Avoid Redux** unless you need time-travel debugging at scale; Query + Zustand covers most travel OTAs.

---

## 7. Navigation

- **Expo Router:** `(auth)` stack (login, signup), `(tabs)` for main app (Home / Search buckets / Bookings / Profile).
- **Stacks per vertical:** `flights/_layout`, nested `search → results → [offerId] → payment`.
- **Deep linking:** `https://app.yoursite.com/flights/...` → offer detail; `payment` return URLs after 3DS — align with web callback design.
- **Back stack:** After successful booking, pop to My Bookings or confirmation; avoid infinite search loops.

---

## 8. UI / UX

- **Design system:** Tamagui or React Native Paper — pick one; theme light/dark from device.
- **Forms:** Match web validation rules (Zod schemas duplicated or shared).
- **Accessibility:** labels on icons, minimum tap targets 44pt.
- **Duffel-heavy flows:** reuse **same conceptual model** as web (offer request → offers → single `offer_id` checkout).

---

## 9. Performance

- **Lists:** `FlashList` for long flight result lists.
- **Images:** airline logos and hotel images via sized URLs; cache with Expo Image.
- **Search:** debounce airport suggest; cancel in-flight requests (AbortController) like web.
- **Bundle:** lazy routes for heavy screens (payment WebView if needed).

---

## 10. Security

- No secrets in repo; use EAS secrets for env.
- Certificate pinning: optional phase 2 for high-risk markets.
- Validate redirects after payment (only allow-listed hosts).
- Jailbreak/root: detect only if compliance requires; don’t block MVP.

---

## 11. Setup and prerequisites

- Node LTS, Xcode (iOS), Android Studio (Android), Expo account, EAS CLI.
- **Env:** `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_API_URL`.
- **Supabase:** enable deep link / redirect URLs for mobile app scheme.

---

## 12. Folder structure (suggested)

```
apps/mobile/
  app/                    # Expo Router routes
  src/
    core/
      api/
      auth/
      config/
    features/
      flights/
      hotels/
      cars/
      bookings/
    components/
    theme/
```

---

## 13. Implementation roadmap

1. **Bootstrap** Expo app, theme, env, API client, Query provider.
2. **Auth** screens + token storage + profile bootstrap.
3. **My Bookings** list + detail (validates end-to-end API + auth).
4. **Flights demo:** search URL params → search API → results list → offer detail → payment WebView/native component per web parity.
5. Hotels + Cars verticals reusing patterns.
6. Deep links, push (optional), analytics, error monitoring (Sentry).
7. Store submission (screenshots, privacy policy URL).

---

## 14. Additional considerations

| Topic | Guidance |
|-------|----------|
| Errors | Map API `code` to toasts;retry only safe ops. |
| Logging | Sentry + scrub PII; no card data in logs. |
| Offline | Read-only cached bookings; show banner when offline. |
| Versioning | `expo-application` version; force upgrade only when API breaks contract. |

---

## 15. Alignment with this repo

- Reuse behavioral docs under `z-docs/DUFFEL_INTEGRATION/` and existing HTTP clients in `src/lib/http/` as the **contract** for mobile DTOs.
- Any new mobile-only auth header support belongs in Next **API middleware**, not duplicated business logic.
