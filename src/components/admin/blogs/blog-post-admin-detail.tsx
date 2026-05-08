import Image from "next/image";
import type { BlogPostDto } from "@/lib/blog/blog.types";
import { Badge } from "@/components/admin_ui/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin_ui/ui/card";
import { cn } from "@/lib/utils";

function formatDateTime(d: Date) {
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type BlogPostAdminDetailProps = {
  post: BlogPostDto;
  className?: string;
};

export function BlogPostAdminDetail({ post, className }: BlogPostAdminDetailProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Status & category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Status: </span>
              <Badge variant="secondary" className="capitalize">
                {post.status}
              </Badge>
            </p>
            <p>
              <span className="text-muted-foreground">Category: </span>
              {post.category.name}
            </p>
            <p className="font-mono text-xs text-muted-foreground">/{post.slug}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Author & times</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Author: </span>
              {post.author.name}
            </p>
            <p>
              <span className="text-muted-foreground">Published: </span>
              {formatDateTime(post.publishedAt)}
            </p>
            <p>
              <span className="text-muted-foreground">Updated: </span>
              {formatDateTime(post.updatedAt)}
            </p>
            <p>
              <span className="text-muted-foreground">Read time: </span>
              {post.readTime} min
            </p>
            <p>
              <span className="text-muted-foreground">Views: </span>
              {post.viewsCount}
            </p>
            {post.featured ? (
              <p>
                <span className="text-muted-foreground">Featured: </span>
                <Badge>Yes</Badge>
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">SEO</CardTitle>
            <CardDescription>
              Values the API uses (empty DB fields fall back to post title and excerpt).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="break-words">
              <span className="text-muted-foreground">Title: </span>
              {post.seo.metaTitle}
            </p>
            <p className="break-words text-muted-foreground">
              <span className="text-foreground/90">Description: </span>
              {post.seo.metaDescription}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Excerpt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{post.excerpt}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Body</CardTitle>
        </CardHeader>
        <CardContent>
          <article
            className="prose prose-sm max-w-none text-foreground dark:prose-invert"
            // Stored HTML is sanitised on write in blog.service
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </CardContent>
      </Card>

      {post.tags.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div>
        <h2 className="mb-3 text-lg font-semibold">Images</h2>
        <ul className="grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {post.images.map((img) => (
            <li key={img.id} className="flex min-w-0 flex-col gap-1.5">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted/30">
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 20vw"
                />
                {img.isFeatured ? (
                  <span className="absolute left-1.5 top-1.5 rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-medium text-amber-950">
                    Cover
                  </span>
                ) : null}
              </div>
              <p className="line-clamp-2 text-xs text-muted-foreground" title={img.alt}>
                {img.alt}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
