"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import type { PermissionDto, PermissionGroupDto } from "@/lib/role/role.types";
import { setRolePermissions } from "@/lib/http/role.client";
import { Button } from "@/components/admin_ui/ui/button";
import { Alert, AlertDescription } from "@/components/admin_ui/ui/alert";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export type RolePermissionManagerProps = {
  roleId: string;
  roleName: string;
  isSystem: boolean;
  currentPermissions: PermissionDto[];
  permissionGroups: PermissionGroupDto[];
};

const CATEGORY_LABELS: Record<string, string> = {
  account: "Account",
  bookings: "Bookings",
  admin: "Administration",
  supplier: "Supplier",
  agent: "Agent",
  other: "Other",
};

export function RolePermissionManager({
  roleId,
  roleName,
  isSystem,
  currentPermissions,
  permissionGroups,
}: RolePermissionManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);

  const currentIds = useMemo(
    () => new Set(currentPermissions.map((p) => p.id)),
    [currentPermissions],
  );

  const [selected, setSelected] = useState<Set<string>>(() => new Set(currentIds));

  const toggle = useCallback((permId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  }, []);

  const toggleCategory = useCallback(
    (group: PermissionGroupDto) => {
      const allSelected = group.permissions.every((p) => selected.has(p.id));
      setSelected((prev) => {
        const next = new Set(prev);
        for (const p of group.permissions) {
          if (allSelected) next.delete(p.id);
          else next.add(p.id);
        }
        return next;
      });
    },
    [selected],
  );

  const dirty = useMemo(() => {
    if (selected.size !== currentIds.size) return true;
    for (const id of selected) {
      if (!currentIds.has(id)) return true;
    }
    return false;
  }, [selected, currentIds]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await setRolePermissions(roleId, Array.from(selected));
      toast({ title: "Permissions updated", description: `Permissions for "${roleName}" saved.` });
      startTransition(() => {
        router.refresh();
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Failed to update permissions",
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setIsSaving(false);
    }
  }, [roleId, roleName, selected, router]);

  const busy = isSaving || isPending;

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Permission assignment</h3>
        <span className="text-xs text-muted-foreground">
          {selected.size} permission{selected.size !== 1 ? "s" : ""} selected
        </span>
      </div>

      {isSystem && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This is a protected system role. Its permissions are managed automatically and cannot be modified.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {permissionGroups.map((group) => {
          const allSelected = group.permissions.every((p) => selected.has(p.id));
          const someSelected = group.permissions.some((p) => selected.has(p.id));
          const label = CATEGORY_LABELS[group.category] ?? group.category;

          return (
            <div key={group.category} className="space-y-2">
              <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={() => toggleCategory(group)}
                    disabled={isSystem}
                    className="accent-primary h-4 w-4"
                  />
                  {label}
                </label>
                <span className="text-xs text-muted-foreground">
                  ({group.permissions.filter((p) => selected.has(p.id)).length}/{group.permissions.length})
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {group.permissions.map((perm) => {
                  const isChecked = selected.has(perm.id);
                  return (
                    <label
                      key={perm.id}
                      className={cn(
                        "flex items-start gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                        isSystem
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer hover:border-primary/20",
                        isChecked
                          ? "border-primary/40 bg-primary/5"
                          : "border-border",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(perm.id)}
                        disabled={isSystem}
                        className="accent-primary mt-0.5 h-4 w-4 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-medium">{perm.id}</span>
                        {perm.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{perm.description}</p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!isSystem && (
        <div className="flex justify-end pt-2">
          <Button
            size="sm"
            disabled={!dirty || busy}
            onClick={() => void handleSave()}
          >
            {isSaving ? "Saving…" : "Save permissions"}
          </Button>
        </div>
      )}
    </div>
  );
}
