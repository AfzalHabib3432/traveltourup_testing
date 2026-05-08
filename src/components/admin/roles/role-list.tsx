"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { KeyRound, Shield, Trash2 } from "lucide-react";
import { deleteRole } from "@/lib/http/role.client";
import { PROTECTED_ROLE_IDS } from "@/lib/authz/registry";
import PageHeader from "@/components/admin_ui/shared/page-header";
import DataTable, { type ColumnDef, type ActionMenuItem } from "@/components/admin_ui/shared/data-table";
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

export type RoleListRow = {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissionCount: number;
  userCount: number;
  created: string;
};

export type RoleListProps = {
  rows: RoleListRow[];
  total: number;
};

function isProtected(roleId: string) {
  return (PROTECTED_ROLE_IDS as readonly string[]).includes(roleId);
}

export function RoleList({ rows, total }: RoleListProps) {
  const router = useRouter();
  const [isListPending, startListTransition] = useTransition();
  const [isRefreshPending, startRefreshTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<RoleListRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, currentPage, pageSize]);

  const onRefresh = useCallback(() => {
    startRefreshTransition(() => {
      router.refresh();
    });
  }, [router]);

  const columns: ColumnDef<RoleListRow>[] = useMemo(
    () => [
      {
        key: "name",
        label: "Name",
        sortable: false,
        className: "font-medium",
        render: (_value: unknown, row: RoleListRow) => (
          <span className="flex items-center gap-2">
            {row.name}
            {row.isSystem && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <Shield className="h-3 w-3" />
                System
              </span>
            )}
          </span>
        ),
      },
      {
        key: "description",
        label: "Description",
        sortable: false,
        className: "text-muted-foreground max-w-[300px] truncate",
      },
      { key: "permissionCount", label: "Permissions", sortable: false },
      { key: "userCount", label: "Users", sortable: false },
      {
        key: "created",
        label: "Created",
        sortable: false,
        className: "text-muted-foreground whitespace-nowrap",
      },
    ],
    [],
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteRole(deleteTarget.id);
      toast({ title: "Role deleted", description: `"${deleteTarget.name}" was removed.` });
      setDeleteTarget(null);
      startListTransition(() => {
        router.refresh();
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Could not delete role.",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, router]);

  const permissionsAction: ActionMenuItem<RoleListRow> = {
    label: "Permissions",
    icon: <KeyRound className="h-4 w-4" />,
    onClick: (row) => {
      router.push(`/admin/roles/${row.id}`);
    },
  };

  const deleteAction: ActionMenuItem<RoleListRow> = {
    label: "Delete",
    icon: <Trash2 className="h-4 w-4" />,
    variant: "destructive",
    disabled: (row) => isProtected(row.id) || row.isSystem,
    onClick: (row) => {
      if (isProtected(row.id) || row.isSystem) {
        toast({ variant: "destructive", title: "System roles cannot be deleted" });
        return;
      }
      if (row.userCount > 0) {
        toast({
          variant: "destructive",
          title: "Role in use",
          description: `Remove all ${row.userCount} user(s) from this role before deleting.`,
        });
        return;
      }
      setDeleteTarget(row);
    },
  };

  return (
    <div className="space-y-6">
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && !isDeleting && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this role?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `"${deleteTarget.name}" will be permanently removed. Users currently assigned this role will lose its permissions. This cannot be undone.`
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
        title="Roles & Permissions"
        subtitle="Manage roles and their permission assignments."
        showAddButton
        addButtonText="New role"
        onAddClick={() => router.push("/admin/roles/new")}
        showRefreshButton
        onRefresh={onRefresh}
        isRefreshing={isRefreshPending}
      />

      <DataTable<RoleListRow>
        data={paginatedRows}
        columns={columns}
        loading={isListPending || isRefreshPending}
        totalCount={total}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        NoOfCards={0}
        showViewToggle={false}
        enablePermissionChecking={false}
        emptyMessage="No roles found."
        actions={{
          view: { enabled: false },
          delete: { enabled: false },
          edit: {
            label: "Edit role",
            onClick: (row) => router.push(`/admin/roles/${row.id}`),
          },
        }}
        customActions={[permissionsAction, deleteAction]}
      />
    </div>
  );
}
