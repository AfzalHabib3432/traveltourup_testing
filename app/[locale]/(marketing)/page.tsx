import type { Metadata } from "next";
import Home from "@/views/Home";
import { metadataForLocalizedRoute } from "@/config/metadata.config";
import { loadLatestFeaturedBlogPostsForHome } from "@/lib/services/blog/blog.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return metadataForLocalizedRoute(locale, "/");
}

export default async function Page() {
  const featuredBlogPosts = await loadLatestFeaturedBlogPostsForHome(4);
  return <Home featuredBlogPosts={featuredBlogPosts} />;
}
