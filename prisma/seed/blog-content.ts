import type { PrismaClient } from "../../src/generated/prisma";

/** Mirrors legacy `src/data/blog.ts` for first-time DB content (idempotent by slug). */
const CATEGORY_SEED = [
  { name: "Travel", slug: "travel" },
  { name: "Tips", slug: "tips" },
  { name: "Guides", slug: "guides" },
  { name: "Flights", slug: "flights" },
] as const;

const POST_SEED = [
  {
    title: "Top 10 Destinations to Visit in 2026",
    slug: "top-destinations-2026",
    content: "<p>Discover the most amazing places to travel in 2026...</p>",
    excerpt: "Discover the most amazing places to travel in 2026 with our expert guide.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    image_alt: "Beach destination",
    category_slug: "travel",
    tags: ["travel", "destinations", "2026"],
    featured: true,
    views_count: 1200,
    read_time: 5,
    meta_title: "Top 10 Destinations 2026",
    meta_description: "Explore the best travel destinations for 2026.",
    published_at: new Date("2026-01-10"),
  },
  {
    title: "How to Travel on a Budget",
    slug: "budget-travel-guide",
    content: "<p>Learn how to save money while traveling...</p>",
    excerpt: "Learn how to save money while traveling without compromising experience.",
    image: "https://images.unsplash.com/photo-1493558103817-58b2924bce98",
    image_alt: "Budget travel",
    category_slug: "tips",
    tags: ["budget", "travel tips"],
    featured: false,
    views_count: 980,
    read_time: 4,
    meta_title: "Budget Travel Guide",
    meta_description: "Save money while traveling smart.",
    published_at: new Date("2026-01-15"),
  },
  {
    title: "Best Beaches Around the World",
    slug: "best-beaches-world",
    content: "<p>Explore stunning beaches across the globe...</p>",
    excerpt: "Explore stunning beaches across the globe for your next vacation.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    image_alt: "Beach",
    category_slug: "travel",
    tags: ["beach", "vacation"],
    featured: true,
    views_count: 2000,
    read_time: 6,
    meta_title: "Best Beaches",
    meta_description: "Top beaches worldwide.",
    published_at: new Date("2026-02-01"),
  },
  {
    title: "Solo Travel Guide for Beginners",
    slug: "solo-travel-guide",
    content: "<p>Traveling solo can be life-changing...</p>",
    excerpt: "A complete beginner guide to solo travel and safety tips.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    image_alt: "Solo travel",
    category_slug: "guides",
    tags: ["solo", "guide"],
    featured: false,
    views_count: 750,
    read_time: 7,
    meta_title: "Solo Travel Guide",
    meta_description: "Travel alone safely and confidently.",
    published_at: new Date("2026-02-05"),
  },
  {
    title: "Top Airlines for International Travel",
    slug: "top-airlines",
    content: "<p>Find the best airlines for your next trip...</p>",
    excerpt: "Find the best airlines for comfort, price, and service.",
    image: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92",
    image_alt: "Airplane",
    category_slug: "flights",
    tags: ["airlines", "flights"],
    featured: true,
    views_count: 1800,
    read_time: 5,
    meta_title: "Top Airlines",
    meta_description: "Best airlines for international trips.",
    published_at: new Date("2026-02-10"),
  },
  {
    title: "Packing Tips for Long Trips",
    slug: "packing-tips",
    content: "<p>Packing smart can save you stress...</p>",
    excerpt: "Packing tips to make your travel smooth and stress-free.",
    image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d",
    image_alt: "Packing",
    category_slug: "tips",
    tags: ["packing", "travel"],
    featured: false,
    views_count: 640,
    read_time: 3,
    meta_title: "Packing Tips",
    meta_description: "Pack efficiently for long trips.",
    published_at: new Date("2026-02-15"),
  },
] as const;

function galleryRowsForPost(
  blogPostId: string,
  p: (typeof POST_SEED)[number],
): Array<{
  blog_post_id: string;
  url: string;
  alt: string;
  sort_order: number;
  is_featured: boolean;
  storage_path: null;
}> {
  const base = {
    blog_post_id: blogPostId,
    url: p.image,
    alt: p.image_alt,
    sort_order: 0,
    is_featured: true,
    storage_path: null as null,
  };
  if (p.slug === "top-destinations-2026") {
    return [
      base,
      {
        blog_post_id: blogPostId,
        url: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff",
        alt: "Travel map and camera",
        sort_order: 1,
        is_featured: false,
        storage_path: null,
      },
    ];
  }
  return [base];
}

export async function seedBlogContent(prisma: PrismaClient): Promise<void> {
  for (const c of CATEGORY_SEED) {
    await prisma.blogCategory.upsert({
      where: { slug: c.slug },
      create: { name: c.name, slug: c.slug },
      update: { name: c.name },
    });
  }

  const categoryIds = new Map<string, string>();
  for (const c of CATEGORY_SEED) {
    const row = await prisma.blogCategory.findUnique({ where: { slug: c.slug } });
    if (row) categoryIds.set(c.slug, row.id);
  }

  for (const p of POST_SEED) {
    const category_id = categoryIds.get(p.category_slug);
    if (!category_id) continue;

    const post = await prisma.blogPost.upsert({
      where: { slug: p.slug },
      create: {
        title: p.title,
        slug: p.slug,
        content: p.content,
        excerpt: p.excerpt,
        tags: [...p.tags],
        status: "published",
        featured: p.featured,
        views_count: p.views_count,
        read_time: p.read_time,
        meta_title: p.meta_title,
        meta_description: p.meta_description,
        published_at: p.published_at,
        category_id,
      },
      update: {
        title: p.title,
        content: p.content,
        excerpt: p.excerpt,
        tags: [...p.tags],
        status: "published",
        featured: p.featured,
        views_count: p.views_count,
        read_time: p.read_time,
        meta_title: p.meta_title,
        meta_description: p.meta_description,
        published_at: p.published_at,
        category_id,
      },
    });

    await prisma.blogPostImage.deleteMany({ where: { blog_post_id: post.id } });
    for (const row of galleryRowsForPost(post.id, p)) {
      await prisma.blogPostImage.create({ data: row });
    }
  }
}
