"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { BlogPostDto } from "@/lib/blog/blog.types";
import { AnimatedBlogCard } from "@/components/blog/blog-explorer-card";
import SectionHeading from "@/components/shared/SectionHeading";
import { cn } from "@/lib/utils";

export type HomeFeaturedBlogsProps = {
  posts: BlogPostDto[];
};

/**
 * Latest featured posts for the marketing home page — same grid + cards as
 * {@link BlogPostsExplorer} (no toolbar or pagination).
 */
export default function HomeFeaturedBlogs({ posts }: HomeFeaturedBlogsProps) {
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations("Home");

  if (posts.length === 0) return null;

  return (
    <section
      className="bg-muted py-10 md:py-12"
      aria-label={t("featuredBlogsTitle")}
    >
      <div className="mx-auto container px-4 md:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 items-start sm:items-center w-full">
            <SectionHeading title={t("featuredBlogsTitle")} subtitle={t("featuredBlogsSubtitle")} />
            <Link href="/blog" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full bg-primary hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] text-md flex items-center justify-center group shadow-md hover:shadow-lg "
                  >
                    {t("featuredBlogsViewAll")}
                    <ArrowRight className="h-6 w-6 ml-2" strokeWidth={2} aria-hidden />
                  </button>
                </Link>
          </div>
         
        </div>
        <motion.div
          layout
          className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-4 md:gap-y-4 mt-4"
        >
          {posts.map((blog) => (
            <AnimatedBlogCard
              key={blog.id}
              blog={blog}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
