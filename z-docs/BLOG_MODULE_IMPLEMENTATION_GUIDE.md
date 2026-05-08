# Blog Module — Complete Implementation Guide

> **Purpose:** This document walks through the blog module as a real, working reference implementation. Follow this exact structure and flow when building any new module (promotions, destinations, packages, tours, etc.). Every file path, function name, and code snippet below is from the live codebase.

---

## 1. Module at a Glance

```mermaid
graph LR
    subgraph "What the Blog module delivers"
        A["Admin Panel<br/>List / Create / Edit / Delete"]
        B["Public Marketing Site<br/>Blog index + detail pages"]
        C["REST API<br/>GET / POST / PATCH / DELETE"]
        D["Image Gallery<br/>Upload, reorder, cover selection"]
    end
```

| Metric | Value |
|--------|-------|
| Total module-specific files | **21** |
| Prisma models | `BlogPost`, `BlogPostImage`, `BlogCategory` |
| Permissions | `admin.blogs:read`, `admin.blogs:write`, `admin.blogs:delete` |
| API base | `GET/POST /api/v1/blogs` — `GET/PATCH/DELETE /api/v1/blogs/[key]` |
| Admin URLs | `/admin/blogs`, `/admin/blogs/new`, `/admin/blogs/[id]/edit` |
| Public URLs | `/blog`, `/blog/[slug]` |

---

## 1.1 Unified Module Pattern

The blog module demonstrates the **unified module pattern** — one set of backend files handles both admin CRUD and public reads with permission checks inside each function.

```mermaid
graph LR
    subgraph BlogModule ["Blog Module (unified backend)"]
        Schema["blog.schema.ts<br/>admin + public schemas"]
        Repo["blog.repository.ts<br/>admin + public queries"]
        Service["blog.service.ts<br/>admin CRUD + public reads<br/>+ mapper + sanitizer + loaders"]
        Controller["blog.controller.ts<br/>admin + public handlers<br/>(permission-gated internally)"]
    end
```

**How the blog controller branches admin vs public on the same `GET /api/v1/blogs` endpoint:**

1. Load auth context via `getServerAuthz()` (works with both cookies and Bearer tokens)
2. Check `hasPermission(authz, "admin.blogs:read")`
3. If admin → parse with `blogAdminListQuerySchema`, call `listAdminBlogPosts()` (all statuses)
4. If public → parse with `blogPublicListQuerySchema`, call `listPublicBlogPosts()` (published only)

This same approach is used in the **user module** where admin CRUD, self-service (`/me`), and role management all live in one service + one controller.

### Authentication: Cookie + Bearer Token

`getServerAuthz()` supports dual auth:
- **Cookie-based session** (web browsers) — tried first
- **`Authorization: Bearer <token>`** (mobile / external clients) — fallback

Once a `userId` is resolved, the RBAC pipeline is identical. Every module's API routes automatically work for both web and mobile with zero additional code.

---

## 2. Architecture — How It All Connects

```mermaid
graph TB
    subgraph Browser ["Browser"]
        AdminUI["Admin Panel<br/>(blog-list, blog-form)"]
        PublicSite["Marketing Pages<br/>(blog-explorer)"]
    end

    subgraph Server ["Next.js Server"]
        subgraph View ["VIEW — Pages (RSC)"]
            AdminPages["Admin Pages<br/>list / new / edit"]
            MarketingPages["Marketing Pages<br/>index / [slug]"]
        end

        subgraph Controller ["CONTROLLER — HTTP"]
            BlogController["blog.controller.ts"]
            BlogClient["blog.client.ts"]
            Routes["route.ts wrappers"]
        end

        subgraph Model ["MODEL — Data + Logic"]
            BlogService["blog.service.ts<br/>(mapper + sanitizer + loaders)"]
            BlogRepo["blog.repository.ts<br/>(includes + types + queries)"]
            BlogSchema["blog.schema.ts<br/>(Zod validation)"]
            BlogTypes["blog.types.ts<br/>(DTO definitions)"]
        end

        RBAC["Permission Guards"]
    end

    DB[("PostgreSQL")]
    Storage["Supabase Storage"]

    AdminUI -->|"POST / PATCH / DELETE"| BlogClient
    BlogClient -->|"fetch with session cookie"| Routes
    Routes -->|"permission check"| RBAC
    RBAC --> BlogController
    BlogController --> BlogService
    BlogController --> BlogSchema

    AdminPages -->|"direct call (no API hop)"| BlogService
    MarketingPages -->|"direct call"| BlogService

    BlogService --> BlogRepo
    BlogService --> BlogTypes
    BlogRepo --> DB

    PublicSite -.->|"SSR HTML"| MarketingPages
    AdminUI -.->|"image upload"| Storage
```

---

## 3. Complete File Map

Every file in the blog module, grouped by MVC layer, with the exact path and line count.

### Model Layer (data access, business logic, validation, types)

| # | File | Lines | Responsibility |
|---|------|-------|----------------|
| 1 | `src/lib/validations/blog.schema.ts` | 92 | All Zod schemas — admin list query, public list query, create body, update body, route params |
| 2 | `src/lib/db/repositories/blog.repository.ts` | 133 | Prisma include config, inferred types, CRUD queries, category lookup |
| 3 | `src/lib/services/blog/blog.service.ts` | 363 | Business logic, row-to-DTO mapper, HTML sanitizer, RSC loaders, category helper |
| 4 | `src/lib/blog/blog.types.ts` | 45 | `BlogPostDto` and `BlogPostImageDto` type definitions (pure TS, safe for client) |

### Controller Layer (HTTP request/response)

| # | File | Lines | Responsibility |
|---|------|-------|----------------|
| 5 | `src/lib/api/blog/blog.controller.ts` | 128 | Parse requests, call service, format responses, handle errors |
| 6 | `src/lib/http/blog.client.ts` | 22 | Browser-side fetch: `createBlogPost`, `updateBlogPost`, `deleteBlogPost` |
| 7 | `app/api/v1/blogs/route.ts` | 17 | Collection route — delegates GET/POST to controller |
| 8 | `app/api/v1/blogs/[key]/route.ts` | 24 | Item route — delegates GET/PATCH/DELETE to controller |

### View Layer (pages + components)

| # | File | Lines | Responsibility |
|---|------|-------|----------------|
| 9 | `app/(admin)/admin/blogs/page.tsx` | 46 | Admin list page (RSC) — calls service directly |
| 10 | `app/(admin)/admin/blogs/new/page.tsx` | 17 | Admin create page (RSC) |
| 11 | `app/(admin)/admin/blogs/[id]/edit/page.tsx` | 34 | Admin edit page (RSC) |
| 12 | `src/components/admin/blogs/blog-list.tsx` | 308 | Admin table, filters, search, delete dialog |
| 13 | `src/components/admin/blogs/blog-form.tsx` | 283 | Admin create/edit form with React Hook Form |
| 14 | `src/components/admin/blogs/blog-images-field.tsx` | 389 | Image gallery: upload, reorder, cover selection |
| 15 | `app/(marketing)/blog/page.tsx` | 18 | Public blog index page (RSC) |
| 16 | `app/(marketing)/blog/[slug]/page.tsx` | 117 | Public blog detail page (RSC) + `generateMetadata` |
| 17 | `app/(marketing)/blog/loading.tsx` | 5 | Index loading skeleton |
| 18 | `app/(marketing)/blog/[slug]/loading.tsx` | 5 | Detail loading skeleton |
| 19 | `src/components/blog/blog-explorer.tsx` | 255 | Marketing grid — client-side filtering, search, pagination |
| 20 | `src/components/blog/blog-skeleton.tsx` | 63 | Skeleton components for loading states |

### Storage + Config (modified, not new)

| # | File | Responsibility |
|---|------|----------------|
| 21 | `src/lib/storage/public-asset/variants/blog-images.variant.ts` | Supabase bucket config, path validation, MIME types |
| — | `prisma/schema.prisma` | BlogPost, BlogPostImage, BlogCategory models (MODIFY) |
| — | `src/lib/authz/registry.ts` | Permission entries (MODIFY) |
| — | `src/components/admin_ui/layout/sidebar.tsx` | Navigation items (MODIFY) |

---

## 4. Data Flow — Every CRUD Operation Explained

### 4.1 Admin List (GET /admin/blogs)

The admin list page is a **Server Component**. It calls the service directly — no API route involved.

```mermaid
sequenceDiagram
    participant Browser
    participant ListPage as page.tsx (RSC)
    participant Schema as blog.schema.ts
    participant Service as blog.service.ts
    participant Repo as blog.repository.ts
    participant DB as PostgreSQL

    Browser->>ListPage: GET /admin/blogs?status=draft&page=2
    ListPage->>ListPage: await searchParams
    ListPage->>Schema: blogAdminListQuerySchema.parse(sp)
    Schema-->>ListPage: typed query { status, page, limit, sort, order }
    ListPage->>Service: listAdminBlogPosts(query)
    Service->>Service: build WHERE clause from filters
    Service->>Repo: findManyPaginatedAdmin({ where, skip, take, orderBy })
    Repo->>DB: Promise.all([ findMany, count ])
    DB-->>Repo: rows[] + total
    Repo-->>Service: { rows, total }
    Service->>Service: rows.map(mapRowToDto) — snake_case to camelCase
    Service-->>ListPage: { items: BlogPostDto[], total }
    ListPage->>ListPage: map DTOs to flat table rows
    ListPage-->>Browser: Stream HTML with <BlogPostList> component
```

**Actual code — admin list page:**

```typescript
// app/(admin)/admin/blogs/page.tsx
const [{ items, total }, categories] = await Promise.all([
  listAdminBlogPosts(query),      // service call — no API hop
  listBlogCategoriesForAdmin(),   // category dropdown data
]);

const rows = items.map((p) => ({
  id: p.id,
  title: p.title,
  slug: p.slug,
  status: p.status,
  category: p.category.name,
  updated: p.updatedAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
}));

return <BlogPostList rows={rows} total={total} query={query} categories={categories} />;
```

**Key insight:** The page is an RSC — it runs on the server. Calling the service directly avoids an unnecessary HTTP roundtrip that would happen if we used `fetch("/api/v1/blogs")`.

---

### 4.2 Admin Create (POST /api/v1/blogs)

Creating a blog post flows through the **full MVC chain** because the form submit happens in the browser.

```mermaid
sequenceDiagram
    participant Form as blog-form.tsx
    participant Client as blog.client.ts
    participant Route as route.ts
    participant RBAC as withPermissionRoute
    participant Ctrl as blog.controller.ts
    participant Schema as blog.schema.ts
    participant Service as blog.service.ts
    participant Repo as blog.repository.ts
    participant DB as PostgreSQL

    Form->>Form: form.handleSubmit — RHF validates locally
    Form->>Client: createBlogPost(body)
    Client->>Route: POST /api/v1/blogs (JSON + session cookie)
    Route->>RBAC: withPermissionRoute("admin.blogs:write")
    RBAC->>RBAC: verify Supabase session + check permission
    RBAC->>Ctrl: handleBlogCollectionPOST(req)
    Ctrl->>Schema: createBlogPostSchema.parse(body)
    Schema-->>Ctrl: validated data (or ZodError)
    Ctrl->>Service: createAdminBlogPost(data)
    Service->>Service: sanitizeStoredBlogHtml(content)
    Service->>Service: buildPublishedAt(status, published_at)
    Service->>Repo: create({ data with images.create[] })
    Repo->>DB: prisma.blogPost.create({ data, include })
    DB-->>Repo: new row with relations
    Service->>Service: mapRowToDto(row)
    Service-->>Ctrl: BlogPostDto
    Ctrl-->>Route: successResponse(dto, 201)
    Route-->>Client: { success: true, data: { id, title, ... } }
    Client-->>Form: BlogPostDto
    Form->>Form: toast("Saved") + router.push("/admin/blogs")
```

**Actual code — the chain step by step:**

**Step 1 — Browser form submits via HTTP client:**

```typescript
// src/lib/http/blog.client.ts
export async function createBlogPost(body: unknown): Promise<BlogPostDto> {
  return adminApiJson<BlogPostDto>("/api/v1/blogs", { method: "POST", body });
}
```

**Step 2 — Route delegates to controller with permission check:**

```typescript
// app/api/v1/blogs/route.ts
export async function POST(req: NextRequest) {
  return withPermissionRoute("admin.blogs:write", () => handleBlogCollectionPOST(req));
}
```

**Step 3 — Controller validates and calls service:**

```typescript
// src/lib/api/blog/blog.controller.ts
export async function handleBlogCollectionPOST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const data = createBlogPostSchema.parse(body);
    const post = await createAdminBlogPost(data);
    return successResponse(post, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Step 4 — Service executes business logic:**

```typescript
// src/lib/services/blog/blog.service.ts
export async function createAdminBlogPost(body: CreateBody): Promise<BlogPostDto> {
  const published_at = buildPublishedAt(body.status, body.published_at, null);
  const row = await blogRepository.create({
    title: body.title,
    slug: body.slug,
    content: sanitizeStoredBlogHtml(body.content),   // HTML safety
    // ... all fields ...
    images: {
      create: body.images.map((img, i) => ({         // nested create
        url: img.url, alt: img.alt,
        sort_order: img.sort_order ?? i,
        is_featured: img.is_featured,
        storage_path: img.storage_path ?? null,
      })),
    },
  });
  return mapRowToDto(row);
}
```

---

### 4.3 Admin Update (PATCH /api/v1/blogs/{id})

Same MVC chain as create, but with partial update semantics.

```mermaid
sequenceDiagram
    participant Form as blog-form.tsx (edit)
    participant Client as blog.client.ts
    participant Route as [key]/route.ts
    participant RBAC as withPermissionRoute
    participant Ctrl as blog.controller.ts
    participant Service as blog.service.ts
    participant Repo as blog.repository.ts
    participant DB as PostgreSQL

    Form->>Client: updateBlogPost(id, body)
    Client->>Route: PATCH /api/v1/blogs/{id}
    Route->>RBAC: withPermissionRoute("admin.blogs:write")
    RBAC->>Ctrl: handleBlogItemPATCH(req, params)
    Ctrl->>Ctrl: parse cuid param + body
    Ctrl->>Service: updateAdminBlogPost(id, data)
    Service->>Repo: findByIdAdmin(id) — verify exists
    alt Not found
        Service-->>Ctrl: throw NotFoundError
        Ctrl-->>Route: 404 { success: false, code: "NOT_FOUND" }
    else Found
        Service->>Service: build partial update (only changed fields)
        Note over Service: Images use replace-all strategy:<br/>deleteMany + create new set
        Service->>Repo: update(id, data)
        Repo->>DB: prisma.blogPost.update(...)
        DB-->>Repo: updated row
        Service->>Service: mapRowToDto(row)
        Service-->>Ctrl: BlogPostDto
        Ctrl-->>Route: { success: true, data: {...} }
    end
```

**Key pattern — partial updates:** The service only sets fields that are present in the request body. This allows PATCH semantics where the client sends only changed fields:

```typescript
const data: BlogPostUpdateInput = {};
if (body.title !== undefined) data.title = body.title;
if (body.slug !== undefined) data.slug = body.slug;
if (body.content !== undefined) data.content = sanitizeStoredBlogHtml(body.content);
// ... only changed fields are set
```

**Key pattern — image replace-all:** When images are updated, the service deletes all existing images and creates the new set. This avoids complex diffing:

```typescript
if (body.images !== undefined) {
  data.images = {
    deleteMany: {},         // remove all existing
    create: body.images.map(...)  // insert new set
  };
}
```

---

### 4.4 Admin Delete (DELETE /api/v1/blogs/{id})

```mermaid
sequenceDiagram
    participant List as blog-list.tsx
    participant Dialog as Confirm Dialog
    participant Client as blog.client.ts
    participant Route as [key]/route.ts
    participant Ctrl as blog.controller.ts
    participant Service as blog.service.ts
    participant DB as PostgreSQL

    List->>Dialog: click delete icon
    Dialog->>Client: deleteBlogPost(id)
    Client->>Route: DELETE /api/v1/blogs/{id}
    Route->>Route: withPermissionRoute("admin.blogs:delete")
    Route->>Ctrl: handleBlogItemDELETE(req, params)
    Ctrl->>Service: deleteAdminBlogPost(id)
    Service->>Service: getAdminBlogPost(id) — throws NotFoundError if missing
    Service->>DB: prisma.blogPost.delete({ where: { id } })
    DB-->>Service: deleted
    Service-->>Ctrl: void
    Ctrl-->>Client: { success: true, data: { ok: true } }
    Client-->>List: resolved
    List->>List: toast("Deleted") + router.refresh()
```

---

### 4.5 Public Blog Index (/blog)

Marketing pages also call the service directly — no API route needed.

```mermaid
sequenceDiagram
    participant Browser
    participant Page as /blog page.tsx (RSC)
    participant Service as blog.service.ts
    participant Repo as blog.repository.ts
    participant DB as PostgreSQL

    Browser->>Page: GET /blog
    Page->>Service: loadPublishedBlogPostsForMarketing()
    Service->>Service: listPublicBlogPosts({ page: 1, limit: 500 })
    Service->>Repo: findManyPublishedPaginated(...)
    Note over Repo: WHERE always includes:<br/>status = "published"<br/>published_at IS NOT NULL
    Repo->>DB: findMany + count
    DB-->>Repo: published rows only
    Service->>Service: rows.map(mapRowToDto)
    Service-->>Page: BlogPostDto[]
    Page-->>Browser: Stream HTML with <BlogPostsExplorer>
```

**Actual code:**

```typescript
// app/(marketing)/blog/page.tsx
export default async function BlogIndexPage() {
  const posts = await loadPublishedBlogPostsForMarketing();
  return (
    <main>
      <BlogPostsExplorer posts={posts} />
    </main>
  );
}
```

---

### 4.6 Public Blog Detail (/blog/[slug]) — with React cache()

```mermaid
sequenceDiagram
    participant Browser
    participant Meta as generateMetadata
    participant Page as /blog/[slug] page.tsx
    participant Service as blog.service.ts (cached)
    participant DB as PostgreSQL

    Browser->>Meta: GET /blog/my-post-slug
    Meta->>Service: loadPublicBlogPostBySlug("my-post-slug")
    Service->>DB: findFirst({ slug, status: "published" })
    DB-->>Service: row
    Service-->>Meta: BlogPostDto
    Meta-->>Meta: return { title, description, openGraph }

    Note over Page,Service: React cache() ensures NO second DB query
    Page->>Service: loadPublicBlogPostBySlug("my-post-slug")
    Service-->>Page: same BlogPostDto from cache
    alt null
        Page->>Page: notFound() — renders 404
    else found
        Page-->>Browser: Stream HTML with blog content
    end
```

**Why `cache()`?** Next.js calls `generateMetadata` and the page body separately. Without `cache()`, the same slug query would hit the database twice per request. React `cache()` deduplicates within a single request.

---

### 4.7 Dual GET — Admin vs Public on Same Endpoint

The collection GET endpoint serves both admin and public consumers using **permission-first branching**:

```mermaid
flowchart TD
    A["GET /api/v1/blogs"] --> B["blog.controller.ts"]
    B --> C["getServerAuthz() — load session"]
    C --> D{"hasPermission<br/>admin.blogs:read?"}

    D -->|"Yes (admin user)"| E["Parse with blogAdminListQuerySchema<br/>(all statuses, wider filters)"]
    E --> F["listAdminBlogPosts(query)<br/>returns drafts + archived + published"]

    D -->|"No (public / anonymous)"| G["Parse with blogPublicListQuerySchema<br/>(published only, lower limits)"]
    G --> H["listPublicBlogPosts(query)<br/>returns ONLY published posts"]

    F --> I["paginatedResponse(items, meta)"]
    H --> I
```

**Why different schemas per branch?** The public schema enforces stricter limits (max 500 vs 100) and different filter fields (`category_slug` vs `category_id`). The admin schema allows filtering by `status`, which should never be exposed to public callers.

---

## 5. Data Transformation Pipeline

Data transforms at each layer boundary. This prevents leaking database conventions into the API.

```mermaid
flowchart LR
    subgraph DB ["PostgreSQL"]
        DBCol["snake_case<br/>published_at<br/>meta_title<br/>is_featured<br/>sort_order"]
    end

    subgraph Repo ["Repository"]
        PRow["Prisma Row<br/>BlogPostRow<br/>(auto-generated types)"]
    end

    subgraph Service ["Service (mapper)"]
        Map["mapRowToDto()<br/>snake → camelCase"]
    end

    subgraph DTO ["DTO"]
        DtoType["BlogPostDto<br/>publishedAt<br/>metaTitle<br/>isFeatured<br/>sortOrder"]
    end

    subgraph API ["HTTP Response"]
        JSON["{<br/>  success: true,<br/>  data: BlogPostDto<br/>}"]
    end

    DBCol --> PRow --> Map --> DtoType --> JSON
```

---

## 6. The Service File — Heart of the Module

The service (`blog.service.ts`) is the **single most important file** in the module. It contains everything that defines the module's behavior:

```mermaid
graph TD
    subgraph "blog.service.ts (363 lines)"
        S1["HTML Sanitizer<br/>(DOMPurify config)"]
        S2["Mapper<br/>(mapRowToDto)"]
        S3["Admin CRUD<br/>(list, get, create, update, delete)"]
        S4["Public Queries<br/>(listPublic, getBySlug)"]
        S5["RSC Loaders<br/>(loadPublished, loadBySlug with cache)"]
        S6["Sub-entity Helpers<br/>(listBlogCategoriesForAdmin)"]
    end

    S1 --> S3
    S2 --> S3
    S2 --> S4
    S4 --> S5
```

**Structure pattern — follow this order in every service file:**

| Section | What it contains | Blog example |
|---------|-----------------|--------------|
| 1. Imports | `"server-only"`, `cache`, domain types | Lines 1–26 |
| 2. Sanitizer | HTML/content sanitization (if module has rich text) | Lines 28–56 |
| 3. Mapper | `mapRowToDto()` and helper functions | Lines 58–124 |
| 4. Admin CRUD | `listAdmin*`, `getAdmin*`, `create*`, `update*`, `delete*` | Lines 126–289 |
| 5. Public queries | `listPublic*`, `getPublic*BySlug` | Lines 291–336 |
| 6. RSC loaders | `loadPublished*`, `load*BySlug` with `cache()` | Lines 338–354 |
| 7. Sub-entity helpers | Category/tag dropdowns | Lines 356–362 |

---

## 7. Error Handling — Consistent Across All Operations

Every error follows a predictable path:

```mermaid
flowchart TD
    A["Error thrown in<br/>Service or Repository"] --> B{"Error type?"}

    B -->|"NotFoundError"| C["404<br/>{ success: false, code: 'NOT_FOUND', message: '...' }"]
    B -->|"ZodError"| D["400<br/>{ success: false, code: 'VALIDATION_ERROR', issues: [...] }"]
    B -->|"AppError"| E["Custom status<br/>{ success: false, code: '...', message: '...' }"]
    B -->|"Auth error"| F["401<br/>{ success: false, code: 'UNAUTHORIZED' }"]
    B -->|"Permission denied"| G["403<br/>{ success: false, code: 'FORBIDDEN' }"]
    B -->|"Unknown"| H["500<br/>{ success: false, code: 'INTERNAL_ERROR' }"]
```

The controller's `try/catch` calls `handleApiError(error)` which maps every error type to the correct HTTP response. **You never need to write custom error handling per module.**

---

## 8. Permission Model — Three Layers of Defense

```mermaid
flowchart TD
    subgraph "Layer 1: Sidebar (UI)"
        UI["Navigation hidden<br/>when user lacks permission<br/>(soft gate — can be bypassed)"]
    end

    subgraph "Layer 2: Route (API)"
        Route["withPermissionRoute()<br/>checks session + permission<br/>returns 403 before controller runs"]
    end

    subgraph "Layer 3: Repository (Data)"
        Repo["Public queries always include<br/>WHERE status = 'published'<br/>AND published_at IS NOT NULL"]
    end

    UI -->|"User calls API directly"| Route
    Route -->|"Permission verified"| Repo
```

| Permission | Protects | Used in |
|-----------|---------|---------|
| `admin.blogs:read` | Viewing blog posts in admin panel | Controller GET (admin branch), sidebar visibility |
| `admin.blogs:write` | Creating and updating blog posts | Route POST/PATCH `withPermissionRoute` |
| `admin.blogs:delete` | Deleting blog posts | Route DELETE `withPermissionRoute` |

---

## 9. How to Create a New Module Using This Pattern

Replace `blog` with your module name (e.g., `hotel`, `promotion`, `destination`) and follow these steps in order.

```mermaid
flowchart TD
    A["1. Prisma Model<br/>schema.prisma"] --> B["2. Permissions<br/>registry.ts"]
    B --> C["3. Zod Schemas<br/>{module}.schema.ts"]
    C --> D["4. Repository<br/>{module}.repository.ts"]
    D --> E["5. DTO Types<br/>{module}.types.ts"]
    E --> F["6. Service<br/>{module}.service.ts"]
    F --> G["7. Controller<br/>{module}.controller.ts"]
    G --> H["8. Route Files<br/>route.ts x 2"]
    H --> I["9. HTTP Client<br/>{module}.client.ts"]
    I --> J["10. Admin Pages<br/>page.tsx x 3"]
    J --> K["11. Admin Components<br/>list + form"]
    K --> L["12. Sidebar Entry"]

    L --> M{"Need public pages?"}
    M -->|Yes| N["13. Add loaders to service<br/>14. Marketing pages<br/>15. Marketing components"]
    M -->|No| Done["Done"]
    N --> O{"Need image uploads?"}
    O -->|Yes| P["16. Storage variant<br/>17. Images field component"]
    O -->|No| Done
    P --> Done

    style A fill:#4CAF50,color:#fff
    style B fill:#FF9800,color:#fff
    style C fill:#2196F3,color:#fff
    style D fill:#4CAF50,color:#fff
    style E fill:#4CAF50,color:#fff
    style F fill:#4CAF50,color:#fff
    style G fill:#9C27B0,color:#fff
    style H fill:#9C27B0,color:#fff
    style I fill:#9C27B0,color:#fff
    style J fill:#F44336,color:#fff
    style K fill:#F44336,color:#fff
    style L fill:#F44336,color:#fff
```

### Step-by-step checklist

| Step | File to create/modify | Copy from blog |
|------|-----------------------|----------------|
| 1 | `prisma/schema.prisma` — add your models | `BlogPost`, `BlogPostImage`, `BlogCategory` |
| 2 | `src/lib/authz/registry.ts` — add 3 permissions | `admin.blogs:read/write/delete` |
| 3 | `src/lib/validations/{module}.schema.ts` | `blog.schema.ts` |
| 4 | `src/lib/db/repositories/{module}.repository.ts` | `blog.repository.ts` |
| 5 | `src/lib/{module}/{module}.types.ts` | `blog.types.ts` |
| 6 | `src/lib/services/{module}/{module}.service.ts` | `blog.service.ts` |
| 7 | `src/lib/api/{module}/{module}.controller.ts` | `blog.controller.ts` |
| 8 | `app/api/v1/{modules}/route.ts` + `[key]/route.ts` | `app/api/v1/blogs/route.ts` |
| 9 | `src/lib/http/{module}.client.ts` | `blog.client.ts` |
| 10 | `app/(admin)/admin/{modules}/page.tsx` + `new/` + `[id]/edit/` | `app/(admin)/admin/blogs/` |
| 11 | `src/components/admin/{modules}/{module}-list.tsx` + `{module}-form.tsx` | `blog-list.tsx`, `blog-form.tsx` |
| 12 | `src/components/admin_ui/layout/sidebar.tsx` — add nav group | Blog section |

---

## 10. Naming Conventions — Mandatory Rules

| Rule | Example |
|------|---------|
| **One prefix per module** — all files use singular domain noun | `blog-*`, `hotel-*`, `promotion-*` (never `blog-post-*`) |
| **Dot-separated suffixes** for lib files | `blog.service.ts`, `blog.schema.ts`, `blog.repository.ts` |
| **Hyphen-separated names** for components | `blog-list.tsx`, `blog-form.tsx`, `blog-explorer.tsx` |
| **PascalCase exports** match the file | `blog-list.tsx` exports `BlogPostList` |
| **API segments** are plural, kebab-case | `/api/v1/blogs`, `/api/v1/hotels` |
| **Permission resource** uses `admin.{plural}` | `admin.blogs:read`, `admin.hotels:write` |
| **Admin URLs** use plural | `/admin/blogs`, `/admin/hotels` |
| **Marketing URLs** use singular | `/blog`, `/hotel` |

---

## 11. HTTP Response Contract

Every API response follows this exact shape. **Never deviate per module.**

```mermaid
flowchart LR
    subgraph Success ["Success Responses"]
        Single["Single item<br/>{ success: true, data: { ... } }"]
        List["Paginated list<br/>{ success: true, data: [...], meta: { total, page, limit, totalPages } }"]
    end

    subgraph Error ["Error Responses"]
        NotFound["404<br/>{ success: false, code: 'NOT_FOUND', message: '...' }"]
        Validation["400<br/>{ success: false, code: 'VALIDATION_ERROR', issues: [...] }"]
        Auth["401/403<br/>{ success: false, code: 'UNAUTHORIZED' / 'FORBIDDEN' }"]
    end
```

---

## 12. Key Design Decisions — Why We Do It This Way

| Decision | Why |
|----------|-----|
| **Unified backend per module** | One service, one controller, one schema, one repository handles admin + public + self-service. Prevents file explosion and keeps all module logic discoverable |
| **Permission-first branching in controller** | Same endpoint serves different data based on auth. Simplifies API surface for both web and mobile clients |
| **Cookie + Bearer token dual auth** | `getServerAuthz()` tries cookies first (web), then `Authorization: Bearer` (mobile). Every module works for both platforms with no additional code |
| **RSC pages call service directly** | Pages run on the server — calling your own API creates an unnecessary HTTP roundtrip |
| **Browser mutations go through API routes** | Form submissions happen in the browser, so they must go through HTTP with permission checks |
| **Service contains mapper, sanitizer, loaders** | These are tightly coupled to the service logic. Separate files add navigation overhead without real separation of concerns |
| **Repository contains Prisma types** | Include configs and inferred types are implementation details of data access — they belong together |
| **Sub-entity queries live in main repository** | A 4-line category lookup doesn't need its own file |
| **No module-specific upload/delete routes** | Generic `/api/v1/storage/upload` and `/api/v1/storage/delete` handle all modules via variant ID |
| **Image replace-all on update** | Simpler than diffing — deleteMany + create avoids stale image state |
| **React cache() for detail page loaders** | Deduplicates DB queries between `generateMetadata` and page body |
| **`import "server-only"` on all server files** | Prevents Next.js from accidentally bundling server code for the browser |

---

## 13. Common Mistakes to Avoid

| Mistake | What happens | Do this instead |
|---------|-------------|-----------------|
| Calling API from RSC pages | Unnecessary HTTP roundtrip, slower page loads | Call service functions directly |
| Separate 7-line service files for sub-entities | File explosion, import chain noise | Inline in main service |
| Separate mapper/sanitizer files | More files to navigate for tightly coupled logic | Keep in service until it exceeds ~500 lines |
| Module-specific upload routes | Duplicates generic storage infrastructure | Use `/api/v1/storage/upload` with variant ID |
| Business logic in route.ts | Untestable, bloated route files | Keep routes thin — delegate to controller |
| Custom JSON response shapes | Breaks `adminApiJson` expectations on the client | Always use `successResponse` / `paginatedResponse` |
| Permission checks only in UI | UI can be bypassed via direct API calls | Enforce in route (withPermissionRoute) + repository (WHERE status) |
| Using `getValues()` instead of `handleSubmit` | `isSubmitting` stays false — user can double-submit | Always use `form.handleSubmit(onSubmit)` |
| Exposing draft posts to public API | Data leak | Public queries always filter `status: "published"` |

---

## 14. Related Documents

| Document | What it covers |
|----------|---------------|
| `MODULE_DEVELOPMENT_GUIDE.md` | **Start here** — comprehensive, up-to-date guide for creating new modules with unified pattern, User module as second reference |
| `PROFESSIONAL_MODULE_CRUD_BLUEPRINT_BLOG_REFERENCE.md` | Generic blueprint with placeholder templates for creating any new module |
| `MOBILE_API_COMPATIBILITY_REQUIREMENTS.md` | Bearer token auth, CORS, mobile client integration |
| `GENERIC_STORAGE_UPLOAD_PLANNING.md` | Public variant uploads and session uploads |
| `PRISMA_MIGRATION_WORKFLOW.md` | Schema-first migrations and drift checks |
| `GENERIC_CRUD_FRONTEND_BLUEPRINT_BLOGS.md` | Admin UI composition with GenericForm / DataTable |
