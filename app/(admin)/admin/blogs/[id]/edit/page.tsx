import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { NotFoundError } from "@/lib/api/errors";
import { getAdminBlogPost, listBlogCategoriesForAdmin } from "@/lib/services/blog/blog.service";
import { BlogPostForm } from "@/components/admin/blogs/blog-form";
import PageHeader from "@/components/admin_ui/shared/page-header";
import { Button } from "@/components/admin_ui/ui/button";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminBlogEditPage({ params }: PageProps) {
  const { id } = await params;
  let post;
  try {
    post = await getAdminBlogPost(id);
  } catch (e) {
    if (e instanceof NotFoundError) {
      notFound();
    }
    throw e;
  }

  const categories = await listBlogCategoriesForAdmin();

  return (
    <>
      <PageHeader
        title="Edit blog post"
        subtitle={post.title}
        showAddButton={false}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/blogs/${id}`} className="gap-1.5">
              <ExternalLink className="h-4 w-4" />
              View post
            </Link>
          </Button>
        }
      />
      <BlogPostForm mode="edit" categories={categories} initial={post} />
    </>
  );
}
