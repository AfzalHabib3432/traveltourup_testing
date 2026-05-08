"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { ExternalLink } from "lucide-react";
import type { z } from "zod";
import { adminWishlistListQuerySchema } from "@/lib/validations/wishlist.schema";
import { WISHLIST_TYPES, wishlistTypeLabel } from "@/lib/wishlist/wishlist.constants";
import type { WishlistType } from "@/lib/wishlist/wishlist.constants";
import { wishlistDetailHref } from "@/lib/wishlist/wishlist.routes";
import PageHeader from "@/components/admin_ui/shared/page-header";
import DataTable, { type ColumnDef, type ActionMenuItem } from "@/components/admin_ui/shared/data-table";
import GenericFilter, { type FilterConfig } from "@/components/admin_ui/shared/generic-filter";

export type WishlistListRow = {
  id: string;
  user_id: string;
  customer: string;
  type_label: string;
  title_line: string;
  ref_id: string;
  saved: string;
  wishlist_type: WishlistType;
  subtitle: string | null;
};

type ListQuery = z.infer<typeof adminWishlistListQuerySchema>;

export type WishlistUserOption = {
  id: string;
  name: string;
};

export type WishlistListProps = {
  rows: WishlistListRow[];
  total: number;
  query: ListQuery;
  /** Users who have wishlist items (for searchable customer filter). */
  wishlistUsers: WishlistUserOption[];
};

export function WishlistList({ rows, total, query, wishlistUsers }: WishlistListProps) {
  const router = useRouter();
  const [isListPending, startListTransition] = useTransition();
  const [isRefreshPending, startRefreshTransition] = useTransition();
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

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
      if (q.user_id) u.set("user_id", q.user_id);
      if (q.type) u.set("type", q.type);
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
          key: "type",
          label: "Type",
          type: "select",
          cols: 12,
          mdCols: 6,
          options: [
            { value: "all", label: "All types" },
            ...WISHLIST_TYPES.map((t) => ({ value: t, label: `${wishlistTypeLabel(t)}s` })),
          ],
        },
        {
          key: "user_id",
          label: "Customer",
          type: "select",
          searchable: true,
          placeholder: "Search by name…",
          cols: 12,
          mdCols: 6,
          options: [
            { value: "all", label: "All customers" },
            ...wishlistUsers.map((u) => ({ value: u.id, label: u.name })),
          ],
        },
      ],
      defaultValues: { type: "all", user_id: "all" },
    }),
    [wishlistUsers],
  );

  const appliedFilters = useMemo(
    () => ({
      type: query.type ?? "all",
      user_id: query.user_id ?? "all",
    }),
    [query],
  );

  const onFilterChange = useCallback(
    (filters: Record<string, unknown>) => {
      const u = new URLSearchParams();
      u.set("page", "1");
      u.set("limit", String(query.limit));
      const t = String(filters.type ?? "all");
      if (t && t !== "all" && (WISHLIST_TYPES as readonly string[]).includes(t)) {
        u.set("type", t);
      }
      const uid = String(filters.user_id ?? "all");
      if (uid && uid !== "all") u.set("user_id", uid);
      if (query.sort) {
        u.set("sort", query.sort);
        u.set("order", query.order);
      }
      navigate(`/admin/wishlists?${u.toString()}`);
    },
    [navigate, query.limit, query.order, query.sort],
  );

  const hasActiveFilters = useMemo(() => {
    return appliedFilters.type !== "all" || appliedFilters.user_id !== "all";
  }, [appliedFilters]);

  const activeFiltersCount = useMemo(() => {
    let n = 0;
    if (appliedFilters.type !== "all") n += 1;
    if (appliedFilters.user_id !== "all") n += 1;
    return n;
  }, [appliedFilters]);

  const columns: ColumnDef<WishlistListRow>[] = useMemo(
    () => [
      {
        key: "customer",
        label: "Customer",
        sortable: false,
        render: (_v, row) => (
          <div className="space-y-1">
            <div className="font-medium text-foreground">{row.customer}</div>
            <div className="font-mono text-xs text-muted-foreground">{row.user_id}</div>
            <Link
              href={`/admin/users/${encodeURIComponent(row.user_id)}`}
              className="inline-block text-xs text-primary hover:underline"
            >
              Admin profile
            </Link>
          </div>
        ),
      },
      { key: "type_label", label: "Type", sortable: true, className: "align-top" },
      {
        key: "title_line",
        label: "Title",
        sortable: false,
        render: (_v, row) => (
          <div className="max-w-[220px]">
            <div className="break-words">{row.title_line}</div>
            {row.subtitle ? <div className="mt-1 text-xs text-muted-foreground">{row.subtitle}</div> : null}
          </div>
        ),
      },
      { key: "ref_id", label: "Ref", sortable: false, className: "font-mono text-xs break-all align-top" },
      {
        key: "saved",
        label: "Saved",
        sortable: true,
        className: "text-muted-foreground whitespace-nowrap align-top",
      },
    ],
    [],
  );

  const sortColumn = (query.sort === "type" ? "type_label" : "saved") as keyof WishlistListRow;
  const sortDirection = query.order;

  const onSort = useCallback(
    (column: keyof WishlistListRow, direction: "asc" | "desc") => {
      const sortField = column === "type_label" ? "type" : "created_at";
      navigate(
        `/admin/wishlists?${buildQs({
          page: 1,
          sort: sortField as ListQuery["sort"],
          order: direction,
        })}`,
      );
    },
    [buildQs, navigate],
  );

  const publicPageAction: ActionMenuItem<WishlistListRow> = {
    label: "Public page",
    icon: <ExternalLink className="h-4 w-4" />,
    onClick: (row) => {
      const href = wishlistDetailHref(row.wishlist_type, row.ref_id);
      window.open(href, "_blank", "noopener,noreferrer");
    },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer wishlists"
        subtitle="Read-only view of saved flights, hotels, and cars. Requires admin.wishlists:read."
        showAddButton={false}
        showFilterButton
        hasActiveFilters={hasActiveFilters}
        isFilterExpanded={isFilterExpanded}
        onFilterToggle={() => setIsFilterExpanded((v) => !v)}
        activeFiltersCount={activeFiltersCount}
        filterText="Filter wishlists"
        clearFiltersText="Clear filters"
        showRefreshButton
        onRefresh={onRefresh}
        isRefreshing={isRefreshPending}
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

      <DataTable<WishlistListRow>
        data={rows}
        columns={columns}
        loading={isListPending || isRefreshPending}
        totalCount={total}
        currentPage={query.page}
        pageSize={query.limit}
        NoOfCards={0}
        onPageChange={(page) => navigate(`/admin/wishlists?${buildQs({ page })}`)}
        onPageSizeChange={(limit) => navigate(`/admin/wishlists?${buildQs({ page: 1, limit })}`)}
        onSort={onSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        showViewToggle={true}
        enablePermissionChecking={false}
        emptyMessage="No wishlist items match your filters."
        actions={{
          view: { enabled: false },
          delete: { enabled: false },
          edit: { enabled: false },
        }}
        customActions={[publicPageAction]}
      />
    </div>
  );
}
