"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { UserListItemDto, RoleDto } from "@/lib/user/user.types";
import { createUser, updateUser } from "@/lib/http/user.client";
import GenericForm, { type SubFormConfig } from "@/components/admin_ui/shared/generic-form";
import { Alert, AlertDescription } from "@/components/admin_ui/ui/alert";

export type UserFormProps = {
  mode: "create" | "edit";
  roles: RoleDto[];
  initial?: UserListItemDto;
};

type FormValues = {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  phone: string;
  phone_country_code: string;
  role_id: string;
};

function buildDefaults(initial: UserListItemDto | undefined, roles: RoleDto[]): FormValues {
  const primaryRole = initial?.roles.find((r) => r.isPrimary) ?? initial?.roles[0];
  return {
    email: initial?.email ?? "",
    first_name: initial?.firstName ?? "",
    last_name: initial?.lastName ?? "",
    password: "",
    phone: initial?.phone ?? "",
    phone_country_code: initial?.phoneCountryCode ?? "",
    role_id: primaryRole?.id ?? roles[0]?.id ?? "",
  };
}

export function UserForm({ mode, roles, initial }: UserFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    defaultValues: buildDefaults(initial, roles),
  });

  const formFields: SubFormConfig[] = useMemo(() => {
    const roleOptions = roles.map((r) => ({ label: r.name, value: r.id }));
    const baseFields: SubFormConfig[] = [
      {
        subform_title: "Account",
        fields: [
          ...(mode === "create"
            ? [
                { name: "email", label: "Email", type: "text" as const, required: true, cols: 12, mdCols: 6 },
                {
                  name: "password",
                  label: "Password",
                  type: "text" as const,
                  placeholder: "Leave blank for invite-only",
                  cols: 12,
                  mdCols: 6,
                },
              ]
            : []),
          {
            name: "role_id",
            label: "Primary role",
            type: "select" as const,
            required: true,
            options: roleOptions,
            cols: 12,
            mdCols: mode === "create" ? 12 : 6,
          },
        ],
      },
      {
        subform_title: "Profile",
        fields: [
          { name: "first_name", label: "First name", type: "text" as const, required: true, cols: 12, mdCols: 6 },
          { name: "last_name", label: "Last name", type: "text" as const, required: true, cols: 12, mdCols: 6 },
          { name: "phone_country_code", label: "Phone code", type: "text" as const, placeholder: "+1", cols: 12, mdCols: 3 },
          { name: "phone", label: "Phone", type: "text" as const, placeholder: "555-1234", cols: 12, mdCols: 9 },
        ],
      },
    ];
    return baseFields;
  }, [roles, mode]);

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);
    try {
      if (mode === "create") {
        const body: Record<string, unknown> = {
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          role_id: data.role_id,
        };
        if (data.password.trim()) body.password = data.password;
        await createUser(body);
      } else if (initial) {
        await updateUser(initial.id, {
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone || null,
          phone_country_code: data.phone_country_code || null,
        });
      }
      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Save failed");
    }
  };

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
        submitText={mode === "create" ? "Create user" : "Save changes"}
        submittingText={mode === "create" ? "Creating…" : "Saving…"}
        showCancel
        cancelText="Cancel"
        onCancel={() => router.push("/admin/users")}
        className="space-y-6"
      />
    </div>
  );
}
