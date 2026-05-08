import { listBlogCategoriesForAdmin } from "@/lib/services/blog/blog.service";
import { BlogPostForm } from "@/components/admin/blogs/blog-form";
import PageHeader from "@/components/admin_ui/shared/page-header";

export const dynamic = "force-dynamic";

export default async function AdminBlogNewPage() {
  const categories = await listBlogCategoriesForAdmin();

  return (
    <>
      <PageHeader title="New blog post" subtitle="Create a post, gallery, and SEO metadata." showAddButton={false} />
      <BlogPostForm mode="create" categories={categories} />
    </>
  );
}
