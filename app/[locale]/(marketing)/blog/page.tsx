import type { Metadata } from "next";
import { metadataForLocalizedRoute } from "@/config/metadata.config";
import { loadPublishedBlogPostsForMarketing } from "@/lib/services/blog/blog.service";
import BlogPostsExplorer from "@/components/blog/blog-explorer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return metadataForLocalizedRoute(locale, "/blog");
}

export default async function BlogIndexPage() {
  const posts = await loadPublishedBlogPostsForMarketing();
  return (
    <main>
      <BlogPostsExplorer posts={posts} />
    </main>
  );
}
