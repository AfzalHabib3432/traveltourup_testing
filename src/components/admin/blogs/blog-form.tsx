"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useForm, useFormState, useWatch, type UseFormReturn } from "react-hook-form";
import type { BlogPostDto } from "@/lib/blog/blog.types";
import { createBlogPost, updateBlogPost } from "@/lib/http/blog.client";
import GenericForm, { type SubFormConfig } from "@/components/admin_ui/shared/generic-form";
import { SeoToolsSection } from "./seo-tools-section";
import {
  galleryItemsFromDto,
  galleryToApiPayload,
  normalizeGallery,
  type GalleryItem,
} from "@/components/storage/StorageGalleryField";
import Image from "next/image";
import {
  deleteStorageFile,
  uploadStorageFile,
} from "@/lib/http/storage.client";
import type { StorageVariantId } from "@/lib/storage/types";
import { Star, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/admin_ui/ui/alert";
import { Badge } from "@/components/admin_ui/ui/badge";
import { Button } from "@/components/admin_ui/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/admin_ui/ui/form";
import { Input } from "@/components/admin_ui/ui/input";
import { cn } from "@/lib/utils";
import { Plus, X, Loader2 } from "lucide-react";

type CategoryOption = { id: string; name: string; slug: string };

export type BlogPostFormProps = {
  mode: "create" | "edit";
  categories: CategoryOption[];
  initial?: BlogPostDto;
};

const BLOG_IMAGES_VARIANT: StorageVariantId = "blog-images";
const BLOG_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

/**
 * Produces a value that matches API `blog.schema` slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
 * (kebab-case, no underscores / uppercase / stray punctuation).
 */
function titleToSlug(raw: string): string {
  if (!raw.trim()) return "";
  const s = raw
    .toLowerCase()
    .trim()
    .replace(/[''`"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "post";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ");
}

function estimateReadMinutesFromHtml(html: string): number {
  const text = stripHtml(html).replace(/\s+/g, " ").trim();
  if (!text) return 1;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function initialImagesFromPost(initial?: BlogPostDto): GalleryItem[] {
  if (!initial?.images?.length) return [];
  return normalizeGallery(galleryItemsFromDto(initial.images, BLOG_IMAGES_VARIANT));
}

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export type BlogPostFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_id: string;
  status: string;
  tags: string[];
  read_time: number;
  meta_title: string;
  meta_description: string;
  focus_keyphrase: string;
  canonical_url: string;
  robots_meta: string;
  published_at: string;
  /** Ordered images; exactly one is featured (cover) when any have a URL. */
  images: GalleryItem[];
};

function buildDefaults(initial: BlogPostDto | undefined, categories: CategoryOption[]): BlogPostFormValues {
  return {
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "<p></p>",
    category_id: initial?.category.id ?? categories[0]?.id ?? "",
    status: initial?.status ?? "draft",
    tags: initial?.tags?.length ? [...initial.tags] : [],
    read_time: initial?.readTime ?? estimateReadMinutesFromHtml(initial?.content ?? ""),
    meta_title: initial?.seo.metaTitle ?? "",
    meta_description: initial?.seo.metaDescription ?? "",
    focus_keyphrase: initial?.seo.focusKeyphrase ?? "",
    canonical_url: initial?.seo.canonicalUrl ?? "",
    robots_meta: initial?.seo.robotsMeta ?? "index,follow",
    published_at: initial?.publishedAt ? toDatetimeLocalValue(new Date(initial.publishedAt)) : "",
    images: initialImagesFromPost(initial),
  };
}

type BlogPostMediaSectionProps = {
  value: GalleryItem[];
  onChange: (next: GalleryItem[]) => void;
  disabled: boolean;
};

function BlogPostMediaSection({ value, onChange, disabled }: BlogPostMediaSectionProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [lineError, setLineError] = useState<string | null>(null);

  const withUrl = useMemo(() => value.filter((i) => i.url.trim()), [value]);

  const runFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList?.length || disabled) return;
      setLineError(null);
      setUploadBusy(true);
      try {
        const files = Array.from(fileList);
        const additions: GalleryItem[] = await Promise.all(
          files.map(async (file) => {
            const data = await uploadStorageFile(file, BLOG_IMAGES_VARIANT);
            return {
              clientId: crypto.randomUUID(),
              url: data.publicUrl ?? data.signedUrl ?? "",
              alt: "",
              isFeatured: false,
              storagePath: data.path,
            } satisfies GalleryItem;
          }),
        );
        onChange(normalizeGallery([...value, ...additions]));
      } catch (e) {
        setLineError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploadBusy(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [disabled, onChange, value],
  );

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    void runFiles(e.target.files);
  };

  const remove = (clientId: string) => {
    const target = value.find((i) => i.clientId === clientId);
    if (target?.storagePath) {
      void deleteStorageFile(BLOG_IMAGES_VARIANT, target.storagePath).catch(() => {});
    }
    const next = value.filter((i) => i.clientId !== clientId);
    onChange(normalizeGallery(next));
  };

  const setFeatured = (clientId: string) => {
    onChange(
      value.map((i) => ({
        ...i,
        isFeatured: i.clientId === clientId && i.url.trim().length > 0,
      })),
    );
  };

  const setAlt = (clientId: string, alt: string) => {
    onChange(
      value.map((i) => (i.clientId === clientId ? { ...i, alt } : i)),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 sm:flex-1">
          <h2 className="text-lg font-semibold text-foreground">Media</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add one or more images. Mark the cover with the star. Alt text is required for each image.
          </p>
        </div>
        <div className="flex flex-col flex-wrap items-start justify-end gap-2 sm:shrink-0 sm:pl-2">
          <div>

          <input
            ref={inputRef}
            type="file"
            accept={BLOG_IMAGE_ACCEPT}
            multiple
            className="sr-only"
            tabIndex={-1}
            disabled={disabled || uploadBusy}
            onChange={onPick}
          />
          <Button
            type="button"
            variant="default"
            size="default"
            disabled={disabled || uploadBusy}
            onClick={() => inputRef.current?.click()}
          >
            {uploadBusy ? (
              <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4 shrink-0" />
            )}
            Add image
          </Button>
          </div>
          <p className="max-w-sm text-left text-xs text-muted-foreground sm:max-w-xs sm:text-right">
            JPG, PNG, WebP, or GIF. Click the star to set the cover image.
          </p>
        </div>
      </div>

      {lineError ? <p className="text-sm text-destructive">{lineError}</p> : null}

      <ul className="flex flex-wrap gap-3 p-0">
        {withUrl.map((item) => (
          <li key={item.clientId} className="flex min-w-0 flex-col gap-2 w-[150px]">
            <div className="group relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted/30 shadow-sm">
              <Image
                src={item.url}
                alt={item.alt || "Blog image"}
                width={150}
                height={150}
                unoptimized
                className="object-cover"
                // sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center gap-2 bg-background/60 backdrop-blur-[2px] transition-all",
                  "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
                )}
              >
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className={cn(
                    "h-9 w-9 border border-border bg-background/90 shadow",
                    item.isFeatured && "border-amber-500/50 bg-amber-500/10",
                  )}
                  disabled={disabled}
                  title={item.isFeatured ? "Cover image" : "Set as cover image"}
                  aria-pressed={item.isFeatured}
                  onClick={() => setFeatured(item.clientId)}
                >
                  <Star className={cn("h-4 w-4", item.isFeatured && "fill-amber-500 text-amber-500")} />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-9 w-9"
                  disabled={disabled}
                  title="Remove image"
                  onClick={() => remove(item.clientId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {item.isFeatured ? (
                <span className="absolute left-2 top-2 rounded bg-amber-500/90 px-2 py-0.5 text-xs font-medium text-amber-950">
                  Cover
                </span>
              ) : null}
            </div>
            <Input
              id={`img-alt-${item.clientId}`}
              value={item.alt}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAlt(item.clientId, e.target.value)}
              disabled={disabled}
              placeholder="Alt text *"
              className="h-9 w-full text-xs"
              aria-label="Image alt text"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

type MetadataFieldsBlockProps = {
  form: UseFormReturn<BlogPostFormValues>;
  isSubmitting: boolean;
  mode: "create" | "edit";
};

function BlogPostMetadataFields({ form, isSubmitting, mode }: MetadataFieldsBlockProps) {
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const parts = tagInput
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const cur: string[] = form.getValues("tags") || [];
    const next = [...cur];
    for (const t of parts) {
      if (!next.includes(t)) next.push(t);
    }
    form.setValue("tags", next, { shouldDirty: true, shouldTouch: true });
    setTagInput("");
  };

  return (
    // add the collapsible section here
    <div className="space-y-6 border-t border-border pt-6">
      <h2 className="text-lg font-semibold text-foreground">Metadata</h2>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-6">
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        placeholder="Comma or type and add"
                        disabled={isSubmitting}
                        autoComplete="off"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={addTag}
                        disabled={isSubmitting || !tagInput.trim()}
                        aria-label="Add tag"
                        className="bg-primary text-primary-foregroundl"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(field.value || []).map((item: string) => (
                        <Badge key={item} variant="secondary" className="flex items-center gap-1 pr-0.5">
                          {item}
                          <button
                            type="button"
                            onClick={() => field.onChange((field.value || []).filter((x: string) => x !== item))}
                            className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                            disabled={isSubmitting}
                            aria-label={`Remove ${item}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <FormField
            control={form.control}
            name="read_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Read time (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    disabled={isSubmitting}
                    name={field.name}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    value={Number.isFinite(field.value) ? field.value : ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.onChange(v === "" ? 0 : Math.max(1, Number(v) || 1));
                    }}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  {mode === "create"
                    ? "Estimated from the body while you type unless you edit this field."
                    : "Minutes to read; change if you want a custom value."}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}

export function BlogPostForm({ mode, categories, initial }: BlogPostFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const prevTitle = useRef(initial?.title ?? "");

  const form = useForm<BlogPostFormValues>({
    defaultValues: buildDefaults(initial, categories),
  });

  // Ensure `images` is part of RHF state (media uses `setValue` only) so submit/dirty behaviour is consistent.
  useEffect(() => {
    void form.register("images");
  }, [form]);

  const contentW = useWatch({ control: form.control, name: "content" });
  const { dirtyFields } = useFormState({ control: form.control });
  const readTimeTouched = Boolean(dirtyFields.read_time);

  const excerptW = useWatch({ control: form.control, name: "excerpt" }) ?? "";
  const metaTitleW = useWatch({ control: form.control, name: "meta_title" }) ?? "";
  const metaDescW = useWatch({ control: form.control, name: "meta_description" }) ?? "";
  const focusKeyphraseW = useWatch({ control: form.control, name: "focus_keyphrase" }) ?? "";
  const tagsW = useWatch({ control: form.control, name: "tags" }) ?? [];

  // Auto slug from title until the user diverges (slug kept in sync with previous title’s slug)
  const titleW = useWatch({ control: form.control, name: "title" });
  const slugW = useWatch({ control: form.control, name: "slug" });
  useEffect(() => {
    const t = (titleW ?? "") as string;
    const s = (slugW ?? "") as string;
    if (!t.trim()) {
      form.setValue("slug", "", { shouldValidate: true, shouldDirty: true });
      prevTitle.current = t;
      return;
    }
    const fromPrev = titleToSlug(prevTitle.current);
    if (s === fromPrev || s === "") {
      form.setValue("slug", titleToSlug(t), { shouldValidate: true, shouldDirty: true });
    }
    prevTitle.current = t;
  }, [titleW, form, slugW]);

  // Auto read time from body in create mode when the user has not changed read time
  useEffect(() => {
    if (mode === "edit") return;
    if (readTimeTouched) return;
    const html = (contentW ?? "") as string;
    form.setValue("read_time", estimateReadMinutesFromHtml(html), { shouldValidate: true });
  }, [contentW, readTimeTouched, form, mode]);

  const formFields: SubFormConfig[] = useMemo(() => {
    const catOptions = categories.map((c) => ({ label: c.name, value: c.id }));
    const baseStatus: { label: string; value: string }[] = [
      { label: "Draft", value: "draft" },
      { label: "Published", value: "published" },
    ];
    const statusOptions =
      initial?.status === "archived" ? [...baseStatus, { label: "Archived", value: "archived" }] : baseStatus;

    const excerptCount = excerptW.length;
    const titleCount = metaTitleW.length;
    const descCount = metaDescW.length;

    return [
      {
        subform_title: "Basics",
        collapse: true,
        fields: [
          { name: "title", label: "Title", type: "text", required: true, cols: 12, mdCols: 6 },
          {
            name: "slug",
            label: "Slug",
            type: "text",
            required: true,
            cols: 12,
            mdCols: 6,
            placeholder: "url-friendly-slug",
            description: "Auto-filled from the title; you can edit.",
          },
          {
            name: "category_id",
            label: "Category",
            type: "select",
            required: true,
            options: catOptions,
            cols: 12,
            mdCols: 4,
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: statusOptions,
            cols: 12,
            mdCols: 4,
          },
          {
            name: "published_at",
            label: "Published at",
            type: "datetime",
            description: "Set when the post should show as published (for Published status).",
            cols: 12,
            mdCols: 4,
          },
        ],
      },
      {
        subform_title: "Content & SEO",
        collapse: true,
        fields: [
          {
            name: "excerpt",
            label: "Excerpt",
            type: "textarea",
            required: true,
            rows: 3,
            cols: 12,
            description: `${excerptCount}/160 · A short intro for cards and search (160 characters recommended)`,
            mdCols: 12,
          },
          {
            name: "meta_title",
            label: "SEO title (optional)",
            type: "text",
            placeholder: "Overrides the page title for search (leave blank to use post title).",
            cols: 12,
            mdCols: 6,
            description: `${titleCount}/60`,
          },
          {
            name: "focus_keyphrase",
            label: "Focus keyphrase (optional)",
            type: "text",
            placeholder: "e.g. family travel in Italy",
            cols: 12,
            mdCols: 6,
            description: "Max 100 characters. Main keyword this post targets.",
          },
          {
            name: "canonical_url",
            label: "Canonical URL (optional)",
            type: "text",
            placeholder: "https://example.com/blog/post-slug",
            cols: 12,
            mdCols: 6,
            description: "Prevents duplicate content; leave blank to auto-generate.",
          },
          {
            name: "robots_meta",
            label: "Robots meta tag",
            type: "select",
            options: [
              { label: "Index, Follow (Default)", value: "index,follow" },
              { label: "NoIndex, Follow", value: "noindex,follow" },
              { label: "Index, NoFollow", value: "index,nofollow" },
              { label: "NoIndex, NoFollow", value: "noindex,nofollow" },
            ],
            cols: 12,
            mdCols: 6,
            description: "Controls search engine indexing behavior.",
          },
          {
            name: "meta_description",
            label: "SEO description (optional)",
            type: "textarea",
            rows: 2,
            cols: 12,
            mdCols: 12,
            description: `${descCount}/160`,
          },
       
          {
            name: "content",
            label: "Body",
            type: "rich-text",
            required: true,
            rows: 8,
            cols: 12,
            placeholder: "Write the post…",
          },
        ],
      },
    ];
  }, [categories, initial?.status, excerptW.length, metaTitleW.length, metaDescW.length]);

  const onSubmit = async (formData: BlogPostFormValues) => {
    setSubmitError(null);
    // Fields updated only via `setValue` (e.g. `images` in the media section) are not part of
    // `formData` unless registered — `getValues` always reflects the latest form state.
    const data: BlogPostFormValues = {
      ...formData,
      images: (form.getValues("images") ?? formData.images) ?? [],
      tags: (form.getValues("tags") ?? formData.tags) ?? [],
    };

    if (!data.images.some((i) => i.url.trim())) {
      setSubmitError("Add at least one image.");
      return;
    }
    if (data.images.some((i) => i.url.trim() && !i.alt.trim())) {
      setSubmitError("Every image must have alt text.");
      return;
    }

    const imagesPayload = galleryToApiPayload(data.images);
    if (imagesPayload.length < 1) {
      setSubmitError("Add at least one image.");
      return;
    }
    if (imagesPayload.filter((i) => i.is_featured).length !== 1) {
      setSubmitError("Set exactly one cover image using the star on an image.");
      return;
    }
    if (data.meta_title.length > 60) {
      setSubmitError("SEO title must be at most 60 characters (or clear it).");
      return;
    }
    if (data.meta_description.length > 160) {
      setSubmitError("SEO description must be at most 160 characters (or clear it).");
      return;
    }

    // Slug in the form can contain uppercase, underscores, or pasted text — re-normalize
    // so the payload always matches the server regex.
    const apiSlug = titleToSlug((data.slug || data.title).trim());
    form.setValue("slug", apiSlug, { shouldValidate: true, shouldDirty: true });

    const body = {
      title: data.title,
      slug: apiSlug,
      content: data.content,
      excerpt: data.excerpt,
      images: imagesPayload,
      tags: data.tags,
      status: data.status,
      featured: initial?.featured ?? false,
      views_count: initial?.viewsCount ?? 0,
      read_time: Number(data.read_time) || 0,
      meta_title: data.meta_title.trim() ? data.meta_title.trim() : null,
      meta_description: data.meta_description.trim() ? data.meta_description.trim() : null,
      focus_keyphrase: data.focus_keyphrase.trim() ? data.focus_keyphrase.trim() : null,
      canonical_url: data.canonical_url.trim() ? data.canonical_url.trim() : null,
      robots_meta: data.robots_meta || "index,follow",
      published_at:
        data.status === "published" && data.published_at
          ? new Date(data.published_at).toISOString()
          : null,
      category_id: data.category_id,
      author_id: null,
    };

    try {
      if (mode === "create") {
        await createBlogPost(body);
      } else if (initial) {
        await updateBlogPost(initial.id, body);
      }
      router.push("/admin/blogs");
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Save failed");
    }
  };

  if (categories.length === 0) {
    return (
      <p className="text-destructive">
        No blog categories in the database. Run{" "}
        <code className="text-sm">npm run db:seed</code> (or add categories) before creating posts.
      </p>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-4">
      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
      <GenericForm
        form={form}
        fields={formFields}
        onSubmit={onSubmit}
        submitText={mode === "create" ? "Create post" : "Save changes"}
        submittingText={mode === "create" ? "Creating…" : "Saving…"}
        showCancel
        cancelText="Cancel"
        onCancel={() => router.push("/admin/blogs")}
        className="w-full min-w-0 space-y-8"
      >
        <div className="w-full min-w-0 space-y-6 border-t border-border pt-6">
        
          <BlogPostMediaSection
            value={form.watch("images")}
            onChange={(next) => form.setValue("images", next, { shouldDirty: true })}
            disabled={form.formState.isSubmitting}
          />
        </div>

        <BlogPostMetadataFields
          form={form}
          isSubmitting={form.formState.isSubmitting}
          mode={mode}
        />

        <SeoToolsSection
          title={titleW ?? ""}
          metaTitle={metaTitleW}
          metaDescription={metaDescW}
          slug={slugW}
          content={contentW ?? ""}
          excerpt={excerptW}
          focusKeyphrase={focusKeyphraseW}
          tags={tagsW}
          postId={initial?.id}
          isSubmitting={form.formState.isSubmitting}
        />
      </GenericForm>
    </div>
  );
}
