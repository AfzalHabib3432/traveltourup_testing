import { listAdminBlogPosts, listBlogCategoriesForAdmin } from "@/lib/services/blog/blog.service";
import { blogAdminListQuerySchema } from "@/lib/validations/blog.schema";
import { BlogPostList } from "@/components/admin/blogs/blog-list";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function AdminBlogsListPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const query = blogAdminListQuerySchema.parse({
    q: first(sp.q) || undefined,
    status: first(sp.status) || undefined,
    category_id: first(sp.category_id) || undefined,
    page: first(sp.page) || undefined,
    limit: first(sp.limit) || undefined,
    sort: first(sp.sort) || undefined,
    order: first(sp.order) || undefined,
  });

  const [{ items, total }, categories] = await Promise.all([
    listAdminBlogPosts(query),
    listBlogCategoriesForAdmin(),
  ]);

  const rows = items.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    status: p.status,
    category: p.category.name,
    updated: p.updatedAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
  }));

  return (
    <BlogPostList rows={rows} total={total} query={query} categories={categories} />
  );
}
