"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Info } from "lucide-react";
import type { RoleDetailDto } from "@/lib/role/role.types";
import { createRole, updateRole } from "@/lib/http/role.client";
import GenericForm, { type SubFormConfig } from "@/components/admin_ui/shared/generic-form";
import { Alert, AlertDescription } from "@/components/admin_ui/ui/alert";

export type RoleFormProps = {
  mode: "create" | "edit";
  initial?: RoleDetailDto;
};

type FormValues = {
  name: string;
  description: string;
};

export function RoleForm({ mode, initial }: RoleFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isProtected = initial?.isSystem === true;

  const form = useForm<FormValues>({
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
    },
  });

  const formFields: SubFormConfig[] = useMemo(
    () => [
      {
        subform_title: "Role details",
        fields: [
          {
            name: "name",
            label: "Name",
            type: "text" as const,
            required: true,
            cols: 12,
            mdCols: 6,
          },
          {
            name: "description",
            label: "Description",
            type: "textarea" as const,
            cols: 12,
            mdCols: 6,
          },
        ],
      },
    ],
    [],
  );

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);
    try {
      if (mode === "create") {
        const created = await createRole({
          name: data.name.trim(),
          description: data.description.trim() || undefined,
        });
        router.push(`/admin/roles/${created.id}`);
      } else if (initial) {
        await updateRole(initial.id, {
          name: data.name.trim(),
          description: data.description.trim() || null,
        });
        router.push("/admin/roles");
      }
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Save failed");
    }
  };

  if (isProtected && mode === "edit") {
    return (
      <div className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This is a system role. Its name and description cannot be changed.
          </AlertDescription>
        </Alert>
        <div className="rounded-lg border border-border p-4">
          <h3 className="mb-4 text-sm font-semibold">Role details</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="mt-1 text-sm text-foreground">{initial?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="mt-1 text-sm text-foreground">{initial?.description || "—"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
      <GenericForm
        form={form}
        fields={formFields}
        onSubmit={onSubmit}
        submitText={mode === "create" ? "Create role" : "Save changes"}
        submittingText={mode === "create" ? "Creating…" : "Saving…"}
        showCancel
        cancelText="Cancel"
        onCancel={() => router.push("/admin/roles")}
        className="space-y-6"
      />
    </div>
  );
}
