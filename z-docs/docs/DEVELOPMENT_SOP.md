# TravelTourUp — Development Standard Operating Procedure (SOP)

> **Purpose**: Ensure consistency, quality, and maintainability across all development work.  
> **Audience**: All developers contributing to the TravelTourUp project.  
> **Last Updated**: March 2026

---

## Table of Contents

1. [Quick Reference Checklist](#1-quick-reference-checklist)
2. [TypeScript & Type Definitions](#2-typescript--type-definitions)
3. [Theme Colors (global.css)](#3-theme-colors-globalcss)
4. [Next.js App Router Best Practices](#4-nextjs-app-router-best-practices)
5. [Creating a New Page](#5-creating-a-new-page)
6. [Creating a New Component](#6-creating-a-new-component)
7. [Component Architecture & Code Quality](#7-component-architecture--code-quality)
8. [Generic & Reusable Patterns](#8-generic--reusable-patterns)
9. [Performance Optimization](#9-performance-optimization)
10. [SEO & Metadata](#10-seo--metadata)
11. [Accessibility](#11-accessibility)
12. [File & Folder Structure](#12-file--folder-structure)

---

## 1. Quick Reference Checklist

Use this checklist before submitting any new page, component, or feature.

| Area | Checklist |
|------|-----------|
| **TypeScript** | [ ] All new files use `.ts` or `.tsx` |
| | [ ] Props and data have explicit types or interfaces |
| | [ ] No `any` unless justified with a comment |
| **Theme** | [ ] Only semantic colors from `globals.css` (e.g. `bg-primary`, `text-foreground`) |
| | [ ] No hardcoded hex colors (e.g. `#0e90c7`) |
| **Pages** | [ ] Route has `metadata` export |
| | [ ] Route metadata added to `ROUTE_METADATA` in `metadata.config.ts` |
| | [ ] Page is a Server Component by default |
| **Components** | [ ] Client components have `"use client"` at top |
| | [ ] Reusable UI lives in `src/components/ui/` |
| | [ ] Used 2+ times → extract to generic component |
| | [ ] Icons use `lucide-react`; custom SVG only when no equivalent exists |
| **Performance** | [ ] Below-fold content uses `dynamic()` with `loading` |
| | [ ] Images use Next.js `Image` with `sizes` and `quality` |
| **Accessibility** | [ ] Interactive elements have `aria-label` where needed |
| | [ ] Decorative SVGs have `aria-hidden` |

---

## 2. TypeScript & Type Definitions

### 2.1 Rules

- **All new files** must use TypeScript (`.ts` or `.tsx`).
- **Props** must have explicit types. Use `interface` or `type`.
- **Avoid `any`**. Use `unknown` and narrow, or define proper types.
- **Export types** that are used across files.

### 2.2 Where to Define Types

| Location | Use For |
|----------|---------|
| `src/types/*.ts` | Shared domain types (Flight, Hotel, Car, Booking) |
| Same file as component | Component-specific props (if not reused) |
| `src/components/ui/*.tsx` | Component props + exported data interfaces |

### 2.3 Examples

**Good — Explicit props interface:**
```tsx
// src/components/FeaturedHotels.tsx
export interface FeaturedHotel {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  reviews: string;
  image: string | { src: string };
  facilities: string[];
  originalPrice?: number;
}

export interface FeaturedHotelsProps {
  hotels?: FeaturedHotel[];
  featuredAd?: { image?: string | { src: string } };
}

const FeaturedHotels = ({ hotels = [], featuredAd = {} }: FeaturedHotelsProps) => {
  // ...
};
```

**Good — Discriminated union for variants:**
```tsx
// src/components/ui/Card.tsx
export type CardProps =
  | { variant: "hotel"; data: HotelCardData; actionHref?: string; className?: string }
  | { variant: "car"; data: CarCardData; actionHref?: string; className?: string }
  | { variant: "category"; data: CategoryCardData; actionHref?: string; className?: string }
  | { variant: "flight"; data: FlightCardData; actionHref?: string; className?: string };

export function Card(props: CardProps) {
  // ...
}
```

**Bad — Untyped props:**
```tsx
// ❌ Avoid
const MyComponent = ({ data }) => { ... };
```

---

## 3. Theme Colors (global.css)

### 3.1 Allowed Colors

**Only use semantic tokens** defined in `app/globals.css`. These work across all theme variants (ocean, sapphire, crimson, aurora, sunset) and light/dark mode.

| Token | Tailwind Class | Use For |
|-------|----------------|---------|
| `--color-background` | `bg-background` | Page/section backgrounds |
| `--color-foreground` | `text-foreground` | Primary text |
| `--color-muted` | `bg-muted`, `text-muted-foreground` | Secondary backgrounds, muted text |
| `--color-border` | `border-border` | Borders |
| `--color-input` | `border-input` | Input borders |
| `--color-ring` | `ring-ring` | Focus rings |
| `--color-primary` | `bg-primary`, `text-primary` | Primary actions, links |
| `--color-primary-600` | `hover:bg-primary-600` | Hover states |
| `--color-primary-foreground` | `text-primary-foreground` | Text on primary bg |
| `--color-card` | `bg-card`, `text-card-foreground` | Card backgrounds |
| `--color-success` | `bg-success`, `text-success` | Success states |
| `--color-destructive` | `bg-destructive` | Errors, delete actions |
| `--color-hero-overlay` | `bg-hero-overlay` | Hero overlays |

### 3.2 Rules

- **Do NOT** use hardcoded hex colors (e.g. `#0e90c7`, `#ffffff`).
- **Do NOT** use arbitrary Tailwind colors (e.g. `bg-blue-500`, `text-gray-600`).
- **Do** use semantic tokens so themes and dark mode work correctly.

**Good:**
```tsx
<div className="bg-background text-foreground border border-border">
  <button className="bg-primary text-primary-foreground hover:bg-primary-600">
    Book Now
  </button>
</div>
```

**Bad:**
```tsx
<div className="bg-white text-slate-900 border border-gray-200">
  <button className="bg-[#0e90c7] text-white">
    Book Now
  </button>
</div>
```

---

## 4. Next.js App Router Best Practices

### 4.1 Server vs Client Components

| Type | When to Use | Directive |
|------|-------------|-----------|
| **Server Component** | Default. Fetch data, no interactivity | None |
| **Client Component** | `useState`, `useEffect`, event handlers, browser APIs | `"use client"` at top |

**Rule**: Start with Server Component. Add `"use client"` only when needed.

### 4.2 Data Fetching

- **Server Components**: Fetch data directly (async/await). No `useEffect` for data.
- **Client Components**: Use `useEffect` or data-fetching libraries (e.g. SWR, React Query) for client-side data.

### 4.3 Route Structure

```
app/
├── layout.tsx          # Root layout (metadata, fonts, providers)
├── page.tsx            # Home
├── about/
│   └── page.tsx
├── flights/
│   ├── page.tsx
│   ├── loading.tsx     # Optional: loading UI
│   └── error.tsx       # Optional: error boundary
└── flightbooking/
    └── page.tsx
```

### 4.4 Layout Pattern

- **`layout.tsx`**: Wraps all pages in a route segment. Use for shared UI (Navbar, Footer).
- **`page.tsx`**: Renders the actual page content. Keep thin; delegate to Views.

---

## 5. Creating a New Page

### 5.1 Step-by-Step

1. **Create route folder** under `app/` (e.g. `app/tours/page.tsx`).

2. **Create page file** with metadata and View:

```tsx
// app/tours/page.tsx
import type { Metadata } from "next";
import ToursView from "@/views/ToursView";
import { createRouteMetadata, ROUTE_METADATA } from "@/config/metadata.config";

export const metadata: Metadata = createRouteMetadata(ROUTE_METADATA["/tours"]);

export default function ToursPage() {
  return <ToursView />;
}
```

3. **Add route metadata** in `src/config/metadata.config.ts`:

```ts
ROUTE_METADATA["/tours"] = {
  title: "Tours & Activities",
  description: "Discover tours and activities for your next trip.",
  openGraph: {
    title: "Tours & Activities — TravelTourUp",
    description: "Discover tours and activities worldwide.",
  },
};
```

4. **Create View** in `src/views/ToursView.tsx` (page-level composition).

5. **Add `loading.tsx`** (optional) for loading state:

```tsx
// app/tours/loading.tsx
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  );
}
```

6. **Add `error.tsx`** (optional) for error boundary:

```tsx
// app/tours/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h2 className="text-xl font-bold text-foreground mb-4">Something went wrong</h2>
      <button
        onClick={reset}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg"
      >
        Try again
      </button>
    </div>
  );
}
```

### 5.2 Page Checklist

- [ ] `page.tsx` exports `metadata`
- [ ] Route added to `ROUTE_METADATA` in `metadata.config.ts`
- [ ] Page is a Server Component (no `"use client"`)
- [ ] View component in `src/views/`
- [ ] `loading.tsx` and `error.tsx` added if needed

---

## 6. Creating a New Component

### 6.1 Where to Place Components

| Location | Use For |
|---------|---------|
| `src/components/ui/` | Reusable UI primitives (Button, Input, Card, Modal) |
| `src/components/` | Feature/section components (FeaturedHotels, Navbar, HeroSection) |
| `src/views/` | Page-level composition (Home, AboutUs, FlightSearch) |

### 6.2 Component Template

**Server Component (default):**
```tsx
// src/components/SectionHeading.tsx
import React from "react";

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export default function SectionHeading({
  title,
  subtitle,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div className={`mb-8 ${align === "center" ? "text-center" : ""}`}>
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      {subtitle && (
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
```

**Client Component:**
```tsx
// src/components/ThemeSelector.tsx
"use client";

import React, { useState } from "react";

export interface ThemeSelectorProps {
  defaultTheme?: string;
}

export default function ThemeSelector({ defaultTheme = "ocean" }: ThemeSelectorProps) {
  const [theme, setTheme] = useState(defaultTheme);
  // ... interactive logic
  return <div>...</div>;
}
```

### 6.3 Component Checklist

- [ ] Props interface defined and exported if reused
- [ ] `"use client"` only if component uses hooks or events
- [ ] Uses theme colors from `globals.css`
- [ ] File named in PascalCase (e.g. `FeaturedHotels.tsx`)

---

## 7. Component Architecture & Code Quality

### 7.1 Principles

1. **Single Responsibility**: One component, one purpose.
2. **Composition over Configuration**: Prefer composing smaller components over large prop objects.
3. **Colocation**: Keep related code close (e.g. types next to component).
4. **Controlled vs Uncontrolled**: Prefer controlled inputs when form state matters.

### 7.2 State Management

- **Local state**: `useState` for UI state (open/closed, selected tab).
- **Form state**: Consider `react-hook-form` for complex forms.
- **Shared state**: Lift state to nearest common parent, or use Context for app-wide state.
- **Avoid**: More than ~5–7 `useState` in one component. Extract to custom hooks or subcomponents.

### 7.3 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `FeaturedHotels`, `Card` |
| Files | PascalCase for components | `FeaturedHotels.tsx` |
| Props interfaces | `ComponentNameProps` | `FeaturedHotelsProps` |
| Data types | PascalCase | `HotelCardData`, `Flight` |
| Hooks | `use` prefix | `useTheme`, `useBooking` |
| Constants | UPPER_SNAKE or camelCase | `ROUTE_METADATA`, `hotelsData` |

### 7.4 Icons — Use lucide-react

- **Prefer `lucide-react`** for all icons. Import only the icons you need:
  ```tsx
  import { ChevronDown, Calendar, Search, MapPin } from "lucide-react";
  ```
- **Replace inline `<svg>` elements** with lucide-react icons wherever a similar icon exists.
- **Keep custom SVG** only when lucide-react has no suitable equivalent (e.g. brand logos like Google/Facebook with specific colors, custom decorative paths, or complex animations).
- **Props**: Use `className` for sizing and `strokeWidth` for stroke thickness. Lucide icons inherit `currentColor` by default.

---

## 8. Generic & Reusable Patterns

### 8.1 Rule: Use 2+ Times → Extract

If a pattern, UI block, or logic is used in **two or more places**, extract it into a reusable component or utility.

### 8.2 Generic Component Pattern

**Example — Card with variants:**

Instead of separate `HotelCard`, `CarCard`, `CategoryCard`, use one `Card` with `variant` and `data`:

```tsx
// Parent only passes variant + data
<Card variant="hotel" data={hotel} actionHref="/hotelbooking" className="h-full" />
<Card variant="car" data={car} actionHref="/carbooking" className="h-full" />
<Card variant="category" data={category} actionHref="/flightbooking" />
<Card variant="flight" data={flight} actionHref="/flightbooking" />
```

All UI logic lives inside `Card`. Parents stay thin.

### 8.3 Data Extraction

- **Mock data**: Move to `src/data/` or colocate in View (e.g. `Home.tsx`).
- **Config**: Use `src/config/` (e.g. `metadata.config.ts`, `navbar.config.js`).
- **Constants**: Define once, import where needed.

### 8.4 Image Handling

- **Always use** Next.js `Image` from `next/image`.
- **Provide** `sizes` for responsive images.
- **Store paths** in constants or config; avoid inline strings scattered across files.

```tsx
// Good
<Image
  src={hotel.image}
  alt={`${hotel.name} - ${hotel.location}`}
  fill
  quality={75}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="object-cover"
/>
```

---

## 9. Performance Optimization

### 9.1 Dynamic Imports

Use `next/dynamic` for **below-the-fold** or heavy components:

```tsx
import dynamic from "next/dynamic";

const FeaturedHotels = dynamic(() => import("@/components/FeaturedHotels"), {
  loading: () => (
    <div className="py-8 bg-muted min-h-[200px] animate-pulse rounded-lg" />
  ),
});
```

### 9.2 Image Optimization

- Use `Image` with `sizes` for responsive loading.
- Use `quality={75}` as default (adjust if needed).
- Prefer images in `public/` for Next.js optimization.

### 9.3 Avoid

- Large inline data in components (move to `src/data/` or fetch).
- Unnecessary `"use client"` (keeps components server-rendered when possible).
- Missing `loading` state for dynamic imports.

---

## 10. SEO & Metadata

### 10.1 Per-Route Metadata

Every route **must** export `metadata`:

```tsx
import type { Metadata } from "next";
import { createRouteMetadata, ROUTE_METADATA } from "@/config/metadata.config";

export const metadata: Metadata = createRouteMetadata(ROUTE_METADATA["/about"]);

export default function Page() {
  return <AboutUs />;
}
```

### 10.2 Centralized Metadata

Add all routes to `src/config/metadata.config.ts`:

```ts
export const ROUTE_METADATA: Record<string, RouteMetadata> = {
  "/about": {
    title: "About Us",
    description: "Learn about TravelTourUp and our mission.",
    openGraph: {
      title: "About Us — TravelTourUp",
      description: "Discover our story and commitment to travelers.",
    },
  },
  // ... other routes
};
```

### 10.3 Dynamic Metadata

For dynamic routes (e.g. `[id]`), use `generateMetadata`:

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await fetchItem(id);
  return {
    title: item.name,
    description: item.description,
  };
}
```

---

## 11. Accessibility

### 11.1 Rules

- **Interactive elements**: Add `aria-label` when text is not visible (e.g. icon-only buttons).
- **Decorative SVGs**: Add `aria-hidden`.
- **Form inputs**: Associate with `<label>` or `aria-labelledby`.
- **Focus**: Ensure focus order is logical; avoid `tabIndex` hacks.

### 11.2 Examples

```tsx
// Icon-only button
<button aria-label="Previous slide" type="button">
  <ChevronLeftIcon />
</button>

// Decorative SVG
<svg aria-hidden>...</svg>

// Form
<label htmlFor="email">Email</label>
<input id="email" type="email" aria-describedby="email-hint" />
<span id="email-hint">We'll never share your email.</span>
```

### 11.3 Motion

`globals.css` already respects `prefers-reduced-motion`. Avoid adding animations that cannot be disabled. Use CSS `@media (prefers-reduced-motion: reduce)` when adding custom animations.

---

## 12. File & Folder Structure

```
traveltourup_next/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── about/
│   │   └── page.tsx
│   ├── flights/
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── error.tsx
│   └── ...
├── src/
│   ├── components/       # Feature components
│   │   ├── ui/          # Reusable UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── FeaturedHotels.tsx
│   │   ├── Navbar.tsx
│   │   └── ...
│   ├── views/           # Page-level composition
│   │   ├── Home.tsx
│   │   ├── AboutUs.tsx
│   │   └── ...
│   ├── config/          # App configuration
│   │   └── metadata.config.ts
│   ├── data/            # Static/mock data (optional)
│   ├── types/           # Shared TypeScript types (optional)
│   └── assets/          # Static assets (SVGs, etc.)
├── public/
│   ├── images/
│   └── favicon.svg
└── docs/
    ├── DEVELOPMENT_SOP.md
    └── NEXTJS_BEST_PRACTICES_MIGRATION_PLAN.md
```

---

## Summary: Before You Submit

1. **TypeScript**: Types for all props and data.
2. **Theme**: Only `globals.css` semantic colors.
3. **Pages**: Metadata + `ROUTE_METADATA` entry.
4. **Components**: `"use client"` only when needed.
5. **Reuse**: Extract anything used 2+ times.
6. **Performance**: Dynamic imports for below-fold; `Image` with `sizes`.
7. **Accessibility**: `aria-label`, `aria-hidden`, proper labels.

For detailed migration and phased improvements, see `NEXTJS_BEST_PRACTICES_MIGRATION_PLAN.md`.
