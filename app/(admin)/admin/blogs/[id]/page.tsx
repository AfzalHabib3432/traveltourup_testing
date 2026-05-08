import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { NotFoundError } from "@/lib/api/errors";
import { getAdminBlogPost } from "@/lib/services/blog/blog.service";
import { BlogPostAdminDetail } from "@/components/admin/blogs/blog-post-admin-detail";
import PageHeader from "@/components/admin_ui/shared/page-header";
import { Button } from "@/components/admin_ui/ui/button";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminBlogDetailPage({ params }: PageProps) {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={post.title}
        subtitle="Read-only view of this post. Edit to change content."
        showAddButton={false}
        showFilterButton={false}
        showRefreshButton={false}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/blogs" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                All posts
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/admin/blogs/${id}/edit`} className="gap-1.5">
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        }
      />
      <BlogPostAdminDetail post={post} />
    </div>
  );
}
