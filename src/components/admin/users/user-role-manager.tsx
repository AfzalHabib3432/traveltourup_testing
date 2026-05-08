"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserRoles } from "@/lib/http/user.client";
import type { RoleDto, UserRoleDto } from "@/lib/user/user.types";
import { Button } from "@/components/admin_ui/ui/button";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export type UserRoleManagerProps = {
  userId: string;
  currentRoles: UserRoleDto[];
  allRoles: RoleDto[];
};

export function UserRoleManager({ userId, currentRoles, allRoles }: UserRoleManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(currentRoles.map((r) => r.id)),
  );
  const [primaryId, setPrimaryId] = useState<string>(
    () => currentRoles.find((r) => r.isPrimary)?.id ?? currentRoles[0]?.id ?? "",
  );
  const [isSaving, setIsSaving] = useState(false);

  const toggle = useCallback((roleId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) {
        next.delete(roleId);
      } else {
        next.add(roleId);
      }
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    const roleIds = Array.from(selected);
    if (roleIds.length === 0) {
      toast({ variant: "destructive", title: "Select at least one role" });
      return;
    }
    const effectivePrimary = selected.has(primaryId) ? primaryId : roleIds[0];

    setIsSaving(true);
    try {
      await setUserRoles(userId, {
        role_ids: roleIds,
        primary_role_id: effectivePrimary,
      });
      toast({ title: "Roles updated" });
      startTransition(() => {
        router.refresh();
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Failed to update roles",
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setIsSaving(false);
    }
  }, [selected, primaryId, userId, router, startTransition]);

  const dirty =
    selected.size !== currentRoles.length ||
    !currentRoles.every((r) => selected.has(r.id)) ||
    primaryId !== (currentRoles.find((r) => r.isPrimary)?.id ?? currentRoles[0]?.id);

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <h3 className="text-sm font-semibold">Role assignment</h3>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {allRoles.map((role) => {
          const isSelected = selected.has(role.id);
          const isPrimary = primaryId === role.id && isSelected;
          return (
            <div
              key={role.id}
              className={cn(
                "flex items-center justify-between rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors",
                isSelected
                  ? "border-primary/40 bg-primary/5"
                  : "border-border hover:border-primary/20",
              )}
              onClick={() => toggle(role.id)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="accent-primary pointer-events-none"
                />
                <span className="truncate font-medium">{role.name}</span>
              </div>
              {isSelected && (
                <button
                  type="button"
                  className={cn(
                    "ml-2 shrink-0 rounded px-2 py-0.5 text-xs font-medium transition-colors",
                    isPrimary
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-primary/10",
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPrimaryId(role.id);
                  }}
                >
                  {isPrimary ? "Primary" : "Set primary"}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-end">
        <Button
          size="sm"
          disabled={!dirty || isSaving || isPending}
          onClick={() => void handleSave()}
        >
          {isSaving ? "Saving…" : "Save roles"}
        </Button>
      </div>
    </div>
  );
}
