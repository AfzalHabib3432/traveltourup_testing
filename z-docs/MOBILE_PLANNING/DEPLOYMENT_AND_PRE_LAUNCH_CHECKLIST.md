# TravelTourUp Mobile — Deployment & Pre-Launch Planning

> Everything you need to discuss, decide, and configure **before writing the first line of mobile code** and **before shipping to the stores**.

---

## Table of Contents

1. [Pre-Development Decisions](#1-pre-development-decisions)
2. [Backend Deployment Readiness](#2-backend-deployment-readiness)
3. [Mobile Build & CI/CD Pipeline](#3-mobile-build--cicd-pipeline)
4. [Environment Strategy](#4-environment-strategy)
5. [App Store & Play Store Preparation](#5-app-store--play-store-preparation)
6. [Domain, SSL & API Configuration](#6-domain-ssl--api-configuration)
7. [CORS & Security Hardening for Production](#7-cors--security-hardening-for-production)
8. [Supabase Production Configuration](#8-supabase-production-configuration)
9. [Monitoring, Crash Reporting & Analytics](#9-monitoring-crash-reporting--analytics)
10. [OTA Updates Strategy](#10-ota-updates-strategy)
11. [Testing Strategy Before Release](#11-testing-strategy-before-release)
12. [Performance Benchmarks](#12-performance-benchmarks)
13. [Legal & Compliance](#13-legal--compliance)
14. [Cost Estimation](#14-cost-estimation)
15. [Pre-Development Checklist](#15-pre-development-checklist)
16. [Pre-Deployment Checklist](#16-pre-deployment-checklist)
17. [Post-Launch Checklist](#17-post-launch-checklist)
18. [Rollback & Incident Response](#18-rollback--incident-response)
19. [Infrastructure Diagram](#19-infrastructure-diagram)

---

## 1. Pre-Development Decisions

These decisions must be made **before writing any code**. Each one affects architecture, cost, and timeline.

### 1.1 Expo Account & EAS Setup

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Expo account | Free / EAS Production ($99/mo) | **Free tier** to start — includes 30 iOS + 30 Android builds/month, 1000 OTA updates/month. Upgrade when build queue times matter. |
| EAS project ID | Create on expo.dev | Required before first build. Run `eas init` in project root. |
| Expo organization | Personal / Team | **Team** if multiple developers. Free tier supports it. |

### 1.2 Apple Developer & Google Play Accounts

| Platform | Cost | Lead Time | Action Required |
|----------|------|-----------|-----------------|
| **Apple Developer Program** | $99/year | 24-48 hours approval | Enroll at [developer.apple.com](https://developer.apple.com). Requires a personal Apple ID or company D-U-N-S number for organizations. |
| **Google Play Console** | $25 one-time | Immediate - 48 hours | Register at [play.google.com/console](https://play.google.com/console). Requires a Google account. |

**Action items before starting:**
- [ ] Enroll in Apple Developer Program (personal or organization)
- [ ] Register Google Play Console account
- [ ] Decide: publish under personal name or company/organization name
- [ ] If company: obtain D-U-N-S number for Apple (takes 5-14 business days)

### 1.3 App Identity

| Item | Decision Needed | Notes |
|------|-----------------|-------|
| **App name** | `TravelTourUp` or custom | Must be unique on both stores. Check availability first. |
| **Bundle ID (iOS)** | `com.traveltourup.mobile` | Cannot change after first App Store submission |
| **Package name (Android)** | `com.traveltourup.mobile` | Cannot change after first Play Store upload |
| **App icon** | Design needed | 1024x1024 PNG (no alpha for iOS). Same base for both platforms. |
| **Splash screen** | Design needed | Expo handles adaptive splash for both platforms |
| **App scheme** | `traveltourup://` | For deep linking. Set once, hard to change. |

### 1.4 Repository Strategy

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Monorepo** (mobile inside `traveltourup_next`) | Share types/schemas, single CI | Larger repo, Expo + Next config can clash | Not recommended for now |
| **Separate repo** (new `traveltourup-mobile`) | Clean separation, independent CI/CD | Manual type syncing | **Recommended** |
| **Monorepo with workspaces** (turborepo) | Best of both, shared packages | Setup complexity | Good for future, overkill for demo |

**Recommendation:** Start with a **separate repo**. Copy shared types manually (or publish a small shared `@traveltourup/types` package later). Simpler CI, simpler mental model.

### 1.5 Minimum Platform Versions

| Platform | Minimum Version | Coverage | Reasoning |
|----------|-----------------|----------|-----------|
| iOS | 16.0+ | ~97% of active devices | Expo SDK 53 minimum |
| Android | API 24 (Android 7.0)+ | ~96% of active devices | Expo SDK 53 minimum |

---

## 2. Backend Deployment Readiness

Your Next.js backend serves both the web app and the mobile app. Before the mobile app goes live, ensure the backend is production-ready.

### 2.1 Current Backend Hosting

| Question | What to Check | Action |
|----------|---------------|--------|
| Where is the Next.js app hosted? | Vercel / AWS / DigitalOcean / self-hosted? | Confirm hosting provider. Vercel is recommended for Next.js 16. |
| What is the production URL? | `https://yourdomain.com` | Mobile app needs a stable, HTTPS production URL |
| Is there a staging environment? | Separate deployment for testing | **Strongly recommended** — mobile app should test against staging first |
| Is the API already serving live traffic? | Web app using `/api/v1/*`? | If yes, mobile is an additional client; ensure rate limits can handle both |

### 2.2 Backend Scaling Considerations

| Concern | Why It Matters | Solution |
|---------|---------------|----------|
| **Concurrent connections** | Mobile + web hitting same API | Vercel handles auto-scaling. Self-hosted: ensure 100+ concurrent connections minimum. |
| **Supabase connection pooling** | Your `DATABASE_URL` uses PgBouncer (port 6543). Good. | Ensure pool size is adequate: Supabase Free = 20 connections, Pro = 100+. |
| **Duffel API rate limits** | Duffel test mode has rate limits | Check Duffel plan before production. Contact Duffel for production API key. |
| **Cold starts** | Serverless functions (Vercel) have cold starts | First request after idle = 1-3s delay. Use Vercel's Edge Functions for auth endpoints if needed. |
| **File upload limits** | Avatar upload, image handling | Vercel body limit = 4.5MB (serverless). Increase via `vercel.json` or use direct-to-Supabase upload. |

### 2.3 Required Backend Environment Variables for Production

```bash
# Production .env (on hosting platform, NOT in code)

# Supabase — use production project (separate from dev)
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<production-service-role-key>

# Database — production connection strings
DATABASE_URL=<production-pooled-url>
DIRECT_URL=<production-direct-url>

# Duffel — PRODUCTION key (not test key)
DUFFEL_API_KEY=duffel_live_<your-production-key>
DUFFEL_API_URL=https://api.duffel.com

# CORS — restrict to your domains + mobile
CORS_ALLOWED_ORIGIN=https://yourdomain.com
# NOTE: For mobile, CORS origin should be "*" or specific handling
# since React Native doesn't send Origin header. See Section 7.

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2.4 Separate Supabase Projects for Dev vs Production

| Environment | Supabase Project | Purpose |
|-------------|-----------------|---------|
| Development | Current (`kendoknarzifeviokock`) | Local dev, testing |
| Staging | New project | Pre-production testing, mobile QA |
| Production | New project | Live users, real bookings |

**Why separate?** Your dev Supabase has test data, test credentials, and `duffel_test_*` key. Production needs:
- Separate auth users (real users, not test accounts)
- Separate database (real bookings, not test data)
- Production Duffel key (real airline/hotel bookings)
- Different rate limits and plans

**Action:** Create a new Supabase project for production (Pro plan recommended: $25/month).

---

## 3. Mobile Build & CI/CD Pipeline

### 3.1 EAS Build Configuration

```json
// eas.json
{
  "cli": { "version": ">= 14.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development",
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "http://192.168.x.x:3000/api/v1"
      }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://staging.yourdomain.com/api/v1"
      }
    },
    "production": {
      "channel": "production",
      "distribution": "store",
      "autoIncrement": true,
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://yourdomain.com/api/v1"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "your-app-store-connect-app-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-key.json",
        "track": "internal"
      }
    }
  }
}
```

### 3.2 Build Types

| Build | When | Who Gets It | How to Install |
|-------|------|-------------|----------------|
| **Development** | During coding | Developer only | Expo Dev Client on physical device or simulator |
| **Preview** | Feature complete, QA testing | Internal testers (team, stakeholders) | EAS internal distribution link (no store needed) |
| **Production** | Ready for public release | Everyone | App Store / Play Store |

### 3.3 CI/CD Pipeline (GitHub Actions Recommended)

```
Feature branch → PR → Review
  │
  ├─ On PR merge to `develop`:
  │    → Run lint + type-check + unit tests
  │    → EAS Build (preview profile)
  │    → Notify team in Slack/Discord with install link
  │
  ├─ On PR merge to `main`:
  │    → Run full test suite
  │    → EAS Build (production profile)
  │    → EAS Submit to App Store Connect (TestFlight) + Play Console (Internal track)
  │    → Await manual approval for public release
  │
  └─ On hotfix tag (`v1.0.x`):
       → OTA update via `eas update` (if JS-only change)
       → OR full build + submit (if native change)
```

### 3.4 GitHub Actions Workflow Example

```yaml
# .github/workflows/eas-build.yml
name: EAS Build & Submit

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm ci
      - run: npx eas build --platform all --profile production --non-interactive
      - run: npx eas submit --platform all --profile production --non-interactive
```

**Required secrets:**
- `EXPO_TOKEN` — from expo.dev → Account Settings → Access Tokens
- Google Play service account JSON (for Android auto-submit)
- Apple App Store Connect API key (for iOS auto-submit)

---

## 4. Environment Strategy

### 4.1 Three-Environment Setup

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Development │     │   Staging    │     │ Production  │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ Local Next   │     │ Deployed     │     │ Deployed     │
│ localhost:3000│    │ staging.xxx  │     │ www.xxx.com  │
│              │     │              │     │              │
│ Dev Supabase │     │ Staging SB   │     │ Prod Supabase│
│ Duffel test  │     │ Duffel test  │     │ Duffel live  │
│              │     │              │     │              │
│ Expo Dev     │     │ EAS Preview  │     │ App Store /  │
│ Client       │     │ Builds       │     │ Play Store   │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 4.2 Environment Variable Management

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `EXPO_PUBLIC_API_BASE_URL` | `http://192.168.x.x:3000/api/v1` | `https://staging.yourdomain.com/api/v1` | `https://yourdomain.com/api/v1` |
| `EXPO_PUBLIC_SENTRY_DSN` | Empty (disabled) | Staging DSN | Production DSN |
| Duffel key (backend) | `duffel_test_*` | `duffel_test_*` | `duffel_live_*` |
| Supabase project (backend) | Dev project | Staging project | Production project |

**Rule:** Mobile app NEVER contains backend secrets (Duffel key, service role key, database URL). Those live only on the server.

---

## 5. App Store & Play Store Preparation

### 5.1 Apple App Store Requirements

| Requirement | Details | Action |
|-------------|---------|--------|
| **App Store Connect listing** | Title, subtitle, description, keywords | Write before submission |
| **Screenshots** | 6.7" (iPhone 15 Pro Max), 6.5" (iPhone 11 Pro Max), 12.9" iPad (if tablet supported) — minimum 3, max 10 per size | Use simulator + `expo-screen-capture` or Figma mockups |
| **App Privacy** | Data collection disclosure (email, name, usage data, crash logs) | Required — fill the privacy questionnaire |
| **App Review Guidelines** | No crashes, complete features, no placeholder content | Test thoroughly on TestFlight first |
| **Review time** | 24-48 hours (first submission can take longer) | Submit early for review, don't wait until launch day |
| **Age rating** | Self-declare content type | Travel/booking = likely 4+ |
| **In-App Purchases** | If booking involves payment in-app, Apple takes 15-30% | **Use external payment** (redirect to web for payment) to avoid Apple commission. Travel bookings are exempt under "reader" apps. |
| **TestFlight** | Internal (25 testers, no review) / External (10K testers, requires review) | Use internal for team, external for beta users |

### 5.2 Google Play Store Requirements

| Requirement | Details | Action |
|-------------|---------|--------|
| **Store listing** | Title (50 chars), short description (80 chars), full description (4000 chars) | Write before first upload |
| **Screenshots** | Minimum 2, recommended 8 per form factor (phone, tablet) | |
| **Feature graphic** | 1024x500 PNG or JPEG | Required for Play Store listing |
| **Content rating** | IARC questionnaire | Travel = likely "Everyone" |
| **Data safety** | Declare data collection, sharing, security practices | Required since 2022 |
| **Target audience** | Declare target age group | 18+ for booking/payment apps |
| **Testing tracks** | Internal (100 testers) → Closed → Open → Production | Use internal track first |
| **Review time** | Hours to days (first app review takes longer) | |
| **20 testers requirement** | Google requires 20 testers for 14 days before production access | Start early with internal testing track |

### 5.3 Common Requirements for Both Stores

| Asset | Specification |
|-------|---------------|
| App icon | 1024x1024 PNG, no transparency (iOS), 512x512 PNG (Android) |
| Privacy policy URL | Required by both stores. Must be publicly accessible. |
| Terms of service URL | Recommended. Host on your website. |
| Support email | Required. Use a professional domain email. |
| Marketing website | Recommended. Link from store listing. |

### 5.4 Payment Considerations for Travel Apps

This is a **critical decision** that affects architecture:

| Approach | Description | Commission | Recommended? |
|----------|-------------|------------|--------------|
| **External payment (web redirect)** | Redirect to web browser for payment processing | 0% to Apple/Google | **Yes** — travel apps qualify as "reader" apps |
| **In-app Stripe SDK** | Process payment inside the app | 0% (Apple exempts physical goods/services like travel) | Yes, but more complex |
| **In-App Purchase** | Use Apple/Google IAP system | 15-30% commission | **No** — travel is a physical service, not digital goods |

**Recommendation:** Use external payment via web redirect or Stripe React Native SDK. Apple and Google both exempt physical goods/services (flights, hotels, car rentals) from IAP requirements.

---

## 6. Domain, SSL & API Configuration

### 6.1 Production Domain Setup

```
yourdomain.com                    → Next.js web app (Vercel)
api.yourdomain.com (optional)     → Proxy to yourdomain.com/api/v1 (if separate API domain desired)
m.yourdomain.com (optional)       → Mobile-specific landing page
```

**For the MVP:** Just use `yourdomain.com/api/v1` as the API base URL. No need for a separate API domain initially.

### 6.2 SSL/TLS

| Requirement | Status |
|-------------|--------|
| All API endpoints must be HTTPS | Vercel provides free SSL automatically. Self-hosted: use Let's Encrypt. |
| Certificate pinning (mobile) | **Not required for MVP.** Consider for v2 with `expo-certificate-transparency`. |
| HSTS headers | Vercel enables by default. Self-hosted: add `Strict-Transport-Security` header. |

### 6.3 API Versioning

Your API is already versioned at `/api/v1/*`. This is critical for mobile because:

- Web app can be updated instantly (server-rendered). Mobile app updates take days (store review) or rely on OTA.
- If you make a **breaking API change**, old mobile app versions will break.

**Rules:**
1. **Never remove or rename fields** in existing v1 responses
2. **Add new fields** freely (backward compatible)
3. **For breaking changes**, create `/api/v2/*` alongside v1
4. **Deprecation window:** Keep v1 alive for minimum 3 months after v2 launch
5. **Force update:** If v1 is sunset, mobile app should show "Please update" dialog

### 6.4 API Version Check Endpoint

Add a simple endpoint to tell the mobile app if it needs to update:

```
GET /api/v1/app-config

Response:
{
  "success": true,
  "data": {
    "min_mobile_version": "1.0.0",       // Force update below this
    "latest_mobile_version": "1.2.0",    // Suggest update below this
    "maintenance_mode": false,
    "feature_flags": {
      "flights_enabled": true,
      "hotels_enabled": true,
      "cars_enabled": true
    }
  }
}
```

This allows you to:
- Force old app versions to update
- Toggle features remotely without a new build
- Put the app in maintenance mode during backend deployments

---

## 7. CORS & Security Hardening for Production

### 7.1 How CORS Works with React Native

**Key fact:** React Native's `fetch` does **NOT** send an `Origin` header. CORS is a browser-only security mechanism. This means:

| Client | Sends `Origin`? | CORS applies? |
|--------|-----------------|---------------|
| Web browser (Next.js) | Yes | Yes — `Access-Control-Allow-Origin` must match |
| React Native (iOS/Android) | No | **No** — CORS headers are ignored by native HTTP clients |
| Postman / cURL | No | No |

### 7.2 Production CORS Configuration

```bash
# Backend .env — production
CORS_ALLOWED_ORIGIN=https://yourdomain.com
```

This correctly restricts browser-based access to your domain only. React Native is unaffected because it doesn't use CORS.

**Do NOT set `CORS_ALLOWED_ORIGIN=*` in production** unless you specifically want any website to call your API.

### 7.3 API Protection for Mobile (Since CORS Doesn't Apply)

Since CORS doesn't protect your API from non-browser clients, implement these server-side protections:

| Protection | Purpose | Implementation |
|------------|---------|----------------|
| **Bearer token required** | All customer endpoints require auth | Already implemented via `getServerAuthz()` |
| **Rate limiting** | Prevent abuse from unknown clients | Add `rate-limiter-flexible` or use Vercel's built-in rate limiting |
| **API key for public endpoints** | Identify known clients | Optional: add `X-API-Key` header for unauthenticated endpoints |
| **Request validation** | Prevent malformed input | Already implemented via Zod schemas |
| **User-Agent logging** | Track which clients are calling | Log `User-Agent` header (RN sends a distinctive one) |

### 7.4 Rate Limiting Recommendations

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Auth (login, signup) | 5 requests | per minute per IP |
| Auth (forgot password) | 3 requests | per minute per email |
| Search (flights, hotels) | 20 requests | per minute per user |
| Booking creation | 5 requests | per minute per user |
| General read endpoints | 60 requests | per minute per user |

---

## 8. Supabase Production Configuration

### 8.1 Supabase Project Setup

| Setting | Development | Production |
|---------|-------------|------------|
| Plan | Free | **Pro ($25/month)** — 8GB DB, 100 connections, daily backups |
| Region | Any | **Same region as your Next.js host** (reduces latency) |
| Password | Dev password | **Strong, unique password** |
| Row Level Security | May be relaxed | **Enforce on all tables** |
| Email templates | Default | **Branded** (confirm email, reset password, magic link) |
| Custom SMTP | Supabase built-in (limited) | **External SMTP** (SendGrid, Resend, Postmark) for deliverability |
| Auth rate limits | Default | Review and adjust for expected user volume |
| Storage | Dev bucket | Production bucket with proper RLS policies |

### 8.2 Email Deliverability

Supabase's built-in email is rate-limited (4 emails/hour on free tier). For production:

| Provider | Cost | Integration |
|----------|------|-------------|
| Resend | Free tier: 3K emails/month | Set in Supabase Dashboard → Auth → SMTP |
| SendGrid | Free tier: 100/day | Same |
| Postmark | $15/month for 10K | Same |

**Action:** Set up external SMTP before launch. Users who don't receive confirmation emails = lost signups.

### 8.3 Supabase Auth Configuration for Mobile

| Setting | Location | Value |
|---------|----------|-------|
| Site URL | Auth → URL Configuration | `https://yourdomain.com` |
| Redirect URLs | Auth → URL Configuration | Add: `traveltourup://reset-password`, `traveltourup://email-confirmed` |
| JWT expiry | Auth → Settings | Default 3600s (1 hour). Consider 1800s (30 min) for tighter security. |
| Refresh token rotation | Auth → Settings | **Enable** — each refresh invalidates the old token |
| Email confirmation | Auth → Settings | **Enable** for production |
| Password minimum length | Auth → Settings | 8 characters minimum |

---

## 9. Monitoring, Crash Reporting & Analytics

### 9.1 Required Services

| Service | Purpose | Free Tier | Setup Time |
|---------|---------|-----------|------------|
| **Sentry** | Crash reporting + performance monitoring | 5K errors/month | 30 min |
| **PostHog** or **Amplitude** | User analytics (funnels, retention) | PostHog: 1M events/month free | 1 hour |
| **EAS Insights** | Build-level analytics | Included with Expo | Automatic |
| **UptimeRobot** or **BetterStack** | API uptime monitoring | 50 monitors free | 15 min |

### 9.2 Critical Alerts to Configure

| Alert | Trigger | Channel |
|-------|---------|---------|
| API downtime | `/api/v1/health` returns non-200 for 2 min | Email + Slack/SMS |
| High error rate | >5% of requests returning 5xx | Sentry alert → Email |
| Mobile crash spike | >1% crash rate | Sentry alert → Email |
| Auth failures spike | >10 failed logins/min from same IP | Server logs → alert |
| Database connection saturation | >80% pool usage | Supabase metrics → alert |

### 9.3 Key Mobile Metrics to Track

| Metric | Why | Tool |
|--------|-----|------|
| App crash rate | Must be <1% for healthy app | Sentry |
| API response time (P95) | Target <500ms for customer-facing | Sentry Performance |
| Time to interactive | App launch → usable screen | Custom tracking |
| Search → Booking conversion | Business metric | PostHog funnel |
| Session duration | Engagement | PostHog |
| Retention (D1, D7, D30) | User stickiness | PostHog |

---

## 10. OTA Updates Strategy

### 10.1 What Can Be Updated OTA vs Requires New Build

| Change Type | OTA? | Requires Store Build? |
|-------------|------|-----------------------|
| Bug fix in JS/TS code | Yes | No |
| UI text/copy change | Yes | No |
| New screen (JS only) | Yes | No |
| Style/theme change | Yes | No |
| New npm package (JS only) | Yes | No |
| New native module (e.g., camera) | **No** | Yes |
| Expo SDK upgrade | **No** | Yes |
| App icon / splash screen change | **No** | Yes |
| `app.json` config change | **No** | Yes |
| iOS/Android permission change | **No** | Yes |

### 10.2 Update Channels

```
production channel    ← App Store / Play Store users
preview channel       ← Internal testers
development channel   ← Developer device only
```

### 10.3 OTA Rollout Strategy

```
1. Push OTA update to `preview` channel
2. Internal team validates on their devices (1-2 hours)
3. Promote to `production` channel
4. Monitor Sentry for 1 hour post-deploy
5. If error rate spikes → roll back via EAS dashboard
```

---

## 11. Testing Strategy Before Release

### 11.1 Testing Layers

| Layer | Tool | What to Test | When |
|-------|------|-------------|------|
| **Unit tests** | Jest + React Native Testing Library | Service functions, formatters, hooks | Every PR |
| **Component tests** | React Native Testing Library | UI components render correctly | Every PR |
| **Integration tests** | Jest + MSW (Mock Service Worker) | API service → mock server → correct state | Weekly |
| **E2E tests** | Detox (or Maestro) | Full user flows (login → search → book) | Before every release |
| **Manual QA** | Physical devices | Visual correctness, gestures, edge cases | Before every release |

### 11.2 Device Testing Matrix

| Platform | Devices to Test | Priority |
|----------|----------------|----------|
| **iOS** | iPhone 15 Pro (latest), iPhone SE 3 (small screen), iPhone 12 (mid), iPad Air | High |
| **Android** | Pixel 8 (stock Android), Samsung Galaxy S24 (Samsung UI), Budget phone (low RAM) | High |
| **Simulators** | iOS Simulator, Android Emulator | Development |
| **Real devices** | At least 2 iOS + 2 Android physical devices | Pre-release |

### 11.3 Pre-Release Testing Checklist

- [ ] Auth flow works end-to-end (signup → email confirm → login → refresh → logout)
- [ ] Booking flow completes (search → select → checkout → confirmation)
- [ ] Deep links open correct screens
- [ ] Push notifications received and tapped (if implemented)
- [ ] App handles no-internet gracefully (shows cached data + banner)
- [ ] App handles API errors gracefully (no crashes, user-friendly messages)
- [ ] App handles slow network (2G/3G simulation in dev tools)
- [ ] App handles background → foreground transition (tokens still valid)
- [ ] App handles force-kill → reopen (session restored from SecureStore)
- [ ] Landscape mode handled (or locked to portrait)
- [ ] Large text / accessibility settings don't break layout
- [ ] All images load and have fallbacks
- [ ] No console warnings in release mode
- [ ] Sentry reports reach dashboard correctly

---

## 12. Performance Benchmarks

### 12.1 Target Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| App cold start | <2 seconds | Time from tap to first interactive screen |
| Screen transition | <300ms | Navigation animation + data fetch |
| API response (P50) | <200ms | Median response time |
| API response (P95) | <500ms | 95th percentile |
| Search results display | <3 seconds | Including Duffel round-trip |
| Memory usage | <150MB | Under normal use |
| App binary size | <30MB (iOS), <20MB (Android) | After Hermes bytecode compilation |
| FPS during scroll | 60 FPS | No frame drops in flight/hotel lists |
| Crash-free rate | >99.5% | Sentry data |

### 12.2 How to Measure

| Tool | What It Measures |
|------|-----------------|
| `react-native-performance` | Component render times, TTI |
| Xcode Instruments | Memory, CPU, GPU, energy (iOS) |
| Android Profiler (Android Studio) | Memory, CPU, network (Android) |
| Flipper (development) | Network requests, layout inspector |
| Sentry Performance | Transaction durations, slow frames |

---

## 13. Legal & Compliance

### 13.1 Required Legal Documents

| Document | Required By | Hosting |
|----------|-------------|---------|
| **Privacy Policy** | Apple, Google, GDPR | Host on your website: `yourdomain.com/privacy` |
| **Terms of Service** | Apple, Google | Host on your website: `yourdomain.com/terms` |
| **Cookie Policy** | GDPR (web only, not mobile) | Web only |

### 13.2 Privacy Policy Must Include

- What personal data you collect (email, name, phone, location)
- Why you collect it (account creation, booking, support)
- How you store it (Supabase with encryption at rest)
- Third-party services that receive data (Supabase, Duffel, Sentry, analytics)
- User rights (access, deletion, export — GDPR/CCPA)
- Data retention period
- Contact information for data requests

### 13.3 GDPR Considerations

| Requirement | Implementation |
|-------------|---------------|
| **Consent for analytics** | Show opt-in dialog before tracking (PostHog/Amplitude) |
| **Right to deletion** | Implement "Delete my account" in profile settings |
| **Data export** | Provide ability to export user's booking history |
| **Data minimization** | Only collect what's necessary for the booking |

### 13.4 PCI DSS (Payment Card Industry)

| If You... | PCI Requirement |
|-----------|-----------------|
| Redirect to external payment page | SAQ-A (minimal, self-assessment) |
| Use Stripe SDK (tokenized) | SAQ A-EP (Stripe handles PCI) |
| Store card numbers yourself | **Full PCI DSS compliance** (avoid this) |

**Recommendation:** Use Stripe (which is PCI Level 1 certified) and never store card details on your servers or in the app.

---

## 14. Cost Estimation

### 14.1 Monthly Operating Costs

| Service | Free Tier | Growth (1K users) | Scale (10K users) |
|---------|-----------|--------------------|--------------------|
| **Supabase** | Free (500MB DB) | Pro $25/month | Pro $25 + add-ons |
| **Vercel** (Next.js hosting) | Free (hobby) | Pro $20/month | Pro $20 + usage |
| **Expo EAS** | Free (30 builds) | Free (sufficient) | Production $99/month |
| **Sentry** | Free (5K errors) | Free (sufficient) | Team $26/month |
| **PostHog** | Free (1M events) | Free (sufficient) | Free (sufficient) |
| **Resend** (email) | Free (3K/month) | Free (sufficient) | $20/month |
| **Duffel** | Test: free | Production: per-booking fees | Per-booking fees |
| **Apple Developer** | — | $99/year ($8.25/mo) | $99/year |
| **Google Play** | — | $25 one-time | $25 one-time |
| **Domain + SSL** | ~$12/year | Same | Same |
| **Total** | **~$0/month** | **~$55/month** | **~$200/month** |

### 14.2 One-Time Costs

| Item | Cost | Notes |
|------|------|-------|
| Apple Developer enrollment | $99 | Annual renewal |
| Google Play registration | $25 | One-time |
| App icon design | $0-200 | Free tools (Figma) or hire designer |
| Screenshots/store assets | $0-100 | Simulator screenshots or design mockups |
| Legal documents (Privacy/ToS) | $0-500 | Templates online (free) or lawyer review |

---

## 15. Pre-Development Checklist

Complete these **before writing the first line of code:**

### Accounts & Access

- [ ] Apple Developer Program enrolled and approved
- [ ] Google Play Console account registered
- [ ] Expo account created at [expo.dev](https://expo.dev)
- [ ] EAS CLI installed (`npm install -g eas-cli`)
- [ ] GitHub/GitLab repository created for mobile app
- [ ] Sentry account created, project set up for React Native

### Design & Identity

- [ ] App name finalized and checked for availability on both stores
- [ ] Bundle ID / package name decided (cannot change after first submission)
- [ ] App icon designed (1024x1024 PNG)
- [ ] Splash screen designed
- [ ] Color palette and typography defined
- [ ] Deep link scheme decided (`traveltourup://`)

### Backend & Infrastructure

- [ ] Production backend URL confirmed (HTTPS)
- [ ] Staging backend deployed and accessible
- [ ] Production Supabase project created (separate from dev)
- [ ] `CORS_ALLOWED_ORIGIN` configured correctly for production
- [ ] External SMTP configured for Supabase auth emails
- [ ] Supabase Redirect URLs updated with mobile deep link schemes
- [ ] Rate limiting implemented on auth endpoints
- [ ] `/api/v1/health` endpoint tested and accessible

### Legal

- [ ] Privacy Policy drafted and hosted on public URL
- [ ] Terms of Service drafted and hosted on public URL
- [ ] GDPR consent flow designed (if serving EU users)
- [ ] Payment approach decided (external redirect vs in-app Stripe)

### Tools

- [ ] Node.js 20 LTS installed
- [ ] Xcode installed and updated (macOS, for iOS development)
- [ ] Android Studio installed with an emulator configured
- [ ] Physical test devices available (at least 1 iOS + 1 Android)
- [ ] Expo Go app installed on test devices

---

## 16. Pre-Deployment Checklist

Complete these **before submitting to the stores:**

### Code Quality

- [ ] All TypeScript errors resolved (`npx tsc --noEmit`)
- [ ] ESLint passes with zero warnings on CI
- [ ] No `console.log` / `console.warn` in production code (use Babel strip plugin)
- [ ] All `TODO` / `FIXME` comments resolved or tracked in issues
- [ ] No hardcoded URLs or secrets in source code

### Functionality

- [ ] All screens tested on iOS simulator + real device
- [ ] All screens tested on Android emulator + real device
- [ ] Auth flow: signup → email confirmation → login → auto-refresh → logout
- [ ] Booking flow: search → select → passenger info → confirm → view in My Bookings
- [ ] Profile: view → edit → change avatar → delete account
- [ ] Error states: no internet, API errors, empty lists, server maintenance
- [ ] Deep links: open correct screens from external URLs

### Performance

- [ ] App binary < 30MB (iOS) / < 20MB (Android)
- [ ] Cold start < 2 seconds on mid-range device
- [ ] No frame drops during scrolling (60 FPS target)
- [ ] Memory leak check: navigate back and forth 20+ times, observe memory
- [ ] Images: all using `expo-image` with caching, no raw `Image` component

### Security

- [ ] All tokens stored in `expo-secure-store` (not AsyncStorage)
- [ ] No sensitive data logged to console
- [ ] Network requests: all HTTPS (no cleartext HTTP)
- [ ] Certificate pinning considered (recommended for financial data)
- [ ] Jailbreak/root detection considered (optional)

### Store Readiness

- [ ] `app.json` version and build numbers set correctly
- [ ] App icon and splash screen configured
- [ ] Store listing text written (title, description, keywords)
- [ ] Screenshots captured for all required device sizes
- [ ] Privacy policy URL set in `app.json` and store listings
- [ ] Data safety / privacy questionnaires filled on both stores
- [ ] Age rating completed on both stores
- [ ] TestFlight (iOS) / Internal testing (Android) validated with testers

### Monitoring

- [ ] Sentry initialized and verified (test crash → appears in dashboard)
- [ ] Analytics events firing correctly
- [ ] Uptime monitoring on `/api/v1/health`
- [ ] Error alert channels configured (email, Slack)

---

## 17. Post-Launch Checklist

Do these **within the first 48 hours after public release:**

### Monitoring

- [ ] Watch Sentry for new crashes (check every 2 hours for first day)
- [ ] Monitor API response times for degradation
- [ ] Check Supabase dashboard for connection pool usage
- [ ] Review analytics for unexpected patterns (high bounce rate, low conversion)
- [ ] Check App Store / Play Store reviews for bug reports

### Validation

- [ ] Download from App Store and test on a fresh device
- [ ] Download from Play Store and test on a fresh device
- [ ] Verify OTA update mechanism works (push a minor text change)
- [ ] Verify push notifications delivered (if implemented)

### Response Plan

- [ ] Critical bug discovered → OTA fix (if JS-only) or expedited build + submit
- [ ] API outage → enable maintenance mode via `/api/v1/app-config`
- [ ] Negative reviews → respond professionally within 24 hours

---

## 18. Rollback & Incident Response

### 18.1 Rollback Strategies

| Scenario | Action | Time to Resolution |
|----------|--------|-------------------|
| **JS bug in production** | Push OTA rollback via `eas update --rollback` | 5-10 minutes |
| **Native crash** | Cannot OTA fix. Submit hotfix build to stores. | iOS: 24-48 hours, Android: 2-24 hours |
| **Backend API breaking change** | Revert backend deployment. Keep old API version alive. | Minutes (Vercel instant rollback) |
| **Supabase outage** | Nothing to do — wait for Supabase recovery. Show maintenance screen in app. | Depends on Supabase |
| **Duffel API outage** | Show "Search temporarily unavailable" error. Bookings from cache/catalog still work. | Depends on Duffel |
| **Compromised tokens** | Rotate Supabase JWT secret. Forces all users to re-authenticate. | 30 minutes |

### 18.2 Incident Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| **P0 — Critical** | App is unusable for all users | Immediate (within 30 min) | Auth completely broken, app crashes on launch |
| **P1 — Major** | Core feature broken for some users | Within 2 hours | Booking flow fails, search returns errors |
| **P2 — Minor** | Non-core feature broken | Within 24 hours | Profile picture upload fails, styling glitch |
| **P3 — Low** | Cosmetic or edge case | Next sprint | Minor text typo, rare device-specific layout issue |

### 18.3 Communication During Incidents

| Audience | Channel | Message |
|----------|---------|---------|
| Internal team | Slack/Discord | Technical details + status updates |
| Users (P0/P1) | In-app maintenance banner (via `/api/v1/app-config`) | "We're experiencing issues and working to fix them." |
| App Store reviews | Store developer response | Acknowledge issue, provide timeline |

---

## 19. Infrastructure Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                                                                  │
│  ┌─────────────────┐    ┌──────────────────┐                    │
│  │   iOS App        │    │   Android App     │                    │
│  │   (App Store)    │    │   (Play Store)    │                    │
│  │                  │    │                   │                    │
│  │  React Native    │    │  React Native     │                    │
│  │  + Expo          │    │  + Expo           │                    │
│  └────────┬─────────┘    └─────────┬─────────┘                   │
│           │     Bearer Token       │                              │
│           └────────────┬───────────┘                              │
│                        │                                          │
│  ┌─────────────────────┼──────────────────────────┐              │
│  │  Web Browser        │                          │              │
│  │  (Next.js SSR)      │                          │              │
│  └─────────────────────┼──────────────────────────┘              │
│                        │  Cookie / Bearer                        │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                    HTTPS │ /api/v1/*
                         │
┌────────────────────────┼─────────────────────────────────────────┐
│                   API LAYER                                       │
│                                                                   │
│  ┌─────────────────────────────────────────────┐                 │
│  │         Next.js 16 (Vercel / Host)           │                 │
│  │                                              │                 │
│  │  proxy.ts ── CORS + preflight handling       │                 │
│  │  /api/v1/auth/* ── Auth proxy endpoints      │                 │
│  │  /api/v1/* ── All module endpoints            │                 │
│  │  getServerAuthz() ── Bearer OR cookie         │                 │
│  │                                              │                 │
│  └──────────┬──────────────────┬────────────────┘                │
│             │                  │                                   │
└─────────────┼──────────────────┼───────────────────────────────────┘
              │                  │
         ┌────┘                  └────┐
         │                            │
┌────────┼────────────┐  ┌────────────┼─────────────┐
│   SUPABASE          │  │     DUFFEL API            │
│                     │  │                           │
│  Auth (JWT)         │  │  Flights (offers/orders)  │
│  PostgreSQL (DB)    │  │  Stays (search/book)      │
│  Storage (files)    │  │  Places (autocomplete)    │
│  Realtime (future)  │  │                           │
└─────────────────────┘  └───────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                   DELIVERY LAYER                                  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│  │ EAS Build    │  │ EAS Update   │  │ EAS Submit          │     │
│  │ (cloud CI)   │  │ (OTA)        │  │ (auto-submit to     │     │
│  │              │  │              │  │  App Store / Play    │     │
│  │  iOS + Android│ │  JS patches  │  │  Store)              │     │
│  └──────────────┘  └──────────────┘  └────────────────────┘     │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │ Sentry       │  │ PostHog      │                             │
│  │ (crashes)    │  │ (analytics)  │                             │
│  └──────────────┘  └──────────────┘                             │
└──────────────────────────────────────────────────────────────────┘
```

---

## Summary of Key Discussion Points

Before starting development, discuss and confirm these with your team:

| # | Topic | Decision Required |
|---|-------|-------------------|
| 1 | Where is the Next.js backend hosted and what is the production URL? | Hosting provider + domain |
| 2 | Are you creating a separate Supabase project for production? | Yes/No + plan |
| 3 | Do you have a Duffel production API key? | Duffel account upgrade needed? |
| 4 | Apple Developer ($99/yr) + Google Play ($25) — who pays and which account? | Individual or organization |
| 5 | App name final? Bundle ID / package name locked? | Cannot change after first submission |
| 6 | Payment handling — external web redirect or in-app Stripe? | Architecture impact |
| 7 | Do you need a staging environment before production? | Timeline impact |
| 8 | Who handles store submissions and reviews? | Role assignment |
| 9 | Privacy policy and Terms of Service — who drafts these? | Legal requirement |
| 10 | Budget approved for estimated monthly costs (~$55/month at 1K users)? | Financial approval |
| 11 | Minimum iOS/Android versions — any reason to support older? | Device coverage |
| 12 | Monorepo or separate repo for mobile app? | Repository strategy |





template lists:

https://codecanyon.net/item/gohotel-hotel-booking-motel-booking-trivago-oyo-airbnb-trip-car-booking-flutter-ui-app/39971697


https://codecanyon.net/item/autocare-car-service-full-app-in-flutter-with-nodejs-backend-service-booking-app-template/53988247



all
https://codecanyon.net/category/mobile?term=car%20booking%20flutter

https://codecanyon.net/category/mobile?term=travel%20booking