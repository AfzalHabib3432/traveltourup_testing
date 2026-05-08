"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { z } from "zod";
import { blogAdminListQuerySchema } from "@/lib/validations/blog.schema";
import { deleteBlogPost } from "@/lib/http/blog.client";
import PageHeader from "@/components/admin_ui/shared/page-header";
import DataTable, { type ColumnDef, type ActionMenuItem } from "@/components/admin_ui/shared/data-table";
import GenericFilter, { type FilterConfig } from "@/components/admin_ui/shared/generic-filter";
import GenericReportExporter, { exportBlogReport } from "@/components/admin_ui/shared/GenericReportExporter";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/admin_ui/ui/alert-dialog";
import { Button } from "@/components/admin_ui/ui/button";

export type BlogPostListRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string;
  updated: string;
};

type ListQuery = z.infer<typeof blogAdminListQuerySchema>;

export type BlogPostListProps = {
  rows: BlogPostListRow[];
  total: number;
  query: ListQuery;
  categories: { id: string; name: string }[];
};

export function BlogPostList({ rows, total, query, categories }: BlogPostListProps) {
  const router = useRouter();
  const [isListPending, startListTransition] = useTransition();
  const [isRefreshPending, startRefreshTransition] = useTransition();
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogPostListRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useCallback(
    (href: string) => {
      startListTransition(() => {
        router.push(href);
      });
    },
    [router, startListTransition],
  );

  const buildQs = useCallback(
    (overrides: Partial<ListQuery>) => {
      const q = { ...query, ...overrides };
      const u = new URLSearchParams();
      u.set("page", String(q.page));
      u.set("limit", String(q.limit));
      if (q.q) u.set("q", q.q);
      if (q.status) u.set("status", q.status);
      if (q.category_id) u.set("category_id", q.category_id);
      if (q.sort) {
        u.set("sort", q.sort);
        u.set("order", q.order);
      }
      return u.toString();
    },
    [query],
  );

  const onRefresh = useCallback(() => {
    startRefreshTransition(() => {
      router.refresh();
    });
  }, [router, startRefreshTransition]);

  const filterConfig: FilterConfig = useMemo(
    () => ({
      fields: [
        {
          key: "q",
          label: "Search",
          type: "text",
          placeholder: "Title, slug, excerpt…",
          cols: 12,
          mdCols: 4,
        },
        {
          key: "status",
          label: "Status",
          type: "select",
          cols: 12,
          mdCols: 4,
          options: [
            { value: "all", label: "All" },
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
            { value: "archived", label: "Archived" },
          ],
        },
        {
          key: "category_id",
          label: "Category",
          type: "select",
          cols: 12,
          mdCols: 4,
          options: [
            { value: "all", label: "All" },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ],
        },
      ],
      defaultValues: { q: "", status: "all", category_id: "all" },
    }),
    [categories],
  );

  const appliedFilters = useMemo(
    () => ({
      q: query.q ?? "",
      status: query.status ?? "all",
      category_id: query.category_id ?? "all",
    }),
    [query],
  );

  const onFilterChange = useCallback(
    (filters: Record<string, unknown>) => {
      const u = new URLSearchParams();
      u.set("page", "1");
      u.set("limit", String(query.limit));
      const qq = String(filters.q ?? "").trim();
      if (qq) u.set("q", qq);
      const st = String(filters.status ?? "all");
      if (st && st !== "all") u.set("status", st);
      const cat = String(filters.category_id ?? "all");
      if (cat && cat !== "all") u.set("category_id", cat);
      if (query.sort) {
        u.set("sort", query.sort);
        u.set("order", query.order);
      }
      navigate(`/admin/blogs?${u.toString()}`);
    },
    [navigate, query.limit, query.order, query.sort],
  );

  const hasActiveFilters = useMemo(() => {
    const q = (appliedFilters.q ?? "").trim();
    return Boolean(q) || appliedFilters.status !== "all" || appliedFilters.category_id !== "all";
  }, [appliedFilters]);

  const activeFiltersCount = useMemo(() => {
    let n = 0;
    if ((appliedFilters.q ?? "").trim()) n += 1;
    if (appliedFilters.status !== "all") n += 1;
    if (appliedFilters.category_id !== "all") n += 1;
    return n;
  }, [appliedFilters]);

  const columns: ColumnDef<BlogPostListRow>[] = useMemo(
    () => [
      { key: "title", label: "Title", sortable: true, className: "max-w-[240px] font-medium" },
      { key: "slug", label: "Slug", sortable: true, className: "font-mono text-xs text-muted-foreground" },
      { key: "status", label: "Status", sortable: true, className: "capitalize" },
      { key: "category", label: "Category", sortable: true },
      { key: "updated", label: "Updated", sortable: true, className: "text-muted-foreground whitespace-nowrap" },
    ],
    [],
  );

  const sortColumn = (query.sort ?? "updated") as keyof BlogPostListRow;
  const sortDirection = query.order;

  const onSort = useCallback(
    (column: keyof BlogPostListRow, direction: "asc" | "desc") => {
      navigate(`/admin/blogs?${buildQs({ page: 1, sort: column as NonNullable<ListQuery["sort"]>, order: direction })}`);
    },
    [buildQs, navigate],
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteBlogPost(deleteTarget.id);
      toast({ title: "Post deleted", description: `"${deleteTarget.title}" was removed.` });
      setDeleteTarget(null);
      startListTransition(() => {
        router.refresh();
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Could not delete post.",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, router, startListTransition]);

  const deleteAction: ActionMenuItem<BlogPostListRow> = {
    label: "Delete",
    icon: <Trash2 className="h-4 w-4" />,
    variant: "destructive",
    onClick: (row) => {
      setDeleteTarget(row);
    },
  };

  return (
    <div className="space-y-6">
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && !isDeleting && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `“${deleteTarget.title}” will be permanently removed. This cannot be undone.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={() => void confirmDelete()}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PageHeader
        title="Blog posts"
        subtitle="Manage posts, categories, and publishing status."
        showAddButton
        addButtonText="New post"
        onAddClick={() => router.push("/admin/blogs/new")}
        showFilterButton
        hasActiveFilters={hasActiveFilters}
        isFilterExpanded={isFilterExpanded}
        onFilterToggle={() => setIsFilterExpanded((v) => !v)}
        activeFiltersCount={activeFiltersCount}
        filterText="Filter posts"
        clearFiltersText="Clear filters"
        showRefreshButton
        onRefresh={onRefresh}
        isRefreshing={isRefreshPending}
        actions={<GenericReportExporter data={rows} />}
      >
        {isFilterExpanded && (
          <GenericFilter
            config={filterConfig}
            values={appliedFilters}
            onFilterChange={onFilterChange}
            collapsible={false}
            presentation="inline"
            title="Filters"
            clearText="Reset"
          />
        )}
      </PageHeader>

      <DataTable<BlogPostListRow>
        data={rows}
        columns={columns}
        loading={isListPending || isRefreshPending}
        totalCount={total}
        currentPage={query.page}
        pageSize={query.limit}
        NoOfCards={0}
        onPageChange={(page) => navigate(`/admin/blogs?${buildQs({ page })}`)}
        onPageSizeChange={(limit) => navigate(`/admin/blogs?${buildQs({ page: 1, limit })}`)}
        onSort={onSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        showViewToggle={true}
        enablePermissionChecking={false}
        emptyMessage="No posts match your filters."
        actions={{
          view: {
            enabled: true,
            onClick: (row) => router.push(`/admin/blogs/${row.id}`),
          },
          delete: { enabled: false },
          edit: {
            onClick: (row) => router.push(`/admin/blogs/${row.id}/edit`),
          },
          export: {
            enabled: true,
            onClick: (row) => {
              void exportBlogReport("excel", [row]);
            },
          },
        }}
        customActions={[deleteAction]}
      />
    </div>
  );
}
