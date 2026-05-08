import { NextRequest } from "next/server";
import { AppError } from "@/lib/api/errors";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";
import { withAuthedRoute, withPermissionRoute } from "@/lib/api/with-route-auth";
import { storageVariantIdSchema, requireStorageVariant } from "@/lib/storage/registry";
import { uploadToStorage } from "@/lib/storage/service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      throw new AppError(400, "Expected multipart form data", "VALIDATION");
    }

    const file = form.get("file");
    const variantRaw = form.get("variant");
    const contextRaw = form.get("context");

    const variantId = storageVariantIdSchema.safeParse(
      typeof variantRaw === "string" ? variantRaw : String(variantRaw ?? ""),
    );
    if (!variantId.success) {
      throw new AppError(400, "Invalid or missing storage variant", "STORAGE_VARIANT_INVALID");
    }

    let context: Record<string, string> | undefined;
    if (typeof contextRaw === "string" && contextRaw) {
      try {
        context = JSON.parse(contextRaw) as Record<string, string>;
      } catch {
        throw new AppError(400, "Invalid context JSON", "VALIDATION");
      }
    }

    const v = requireStorageVariant(variantId.data);

    const routeWrapper = v.selfService
      ? withAuthedRoute
      : (handler: (ctx: { userId: string }) => Promise<Response>) =>
          withPermissionRoute(v.writePermission, handler);

    return await routeWrapper(async ({ userId }) => {
      if (!file || !(file instanceof File)) {
        throw new AppError(400, "Missing file field", "VALIDATION");
      }
      if (!file.size) {
        throw new AppError(400, "Empty file", "VALIDATION");
      }

      const enrichedContext = { ...context, userId };
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToStorage({
        variantId: v.id,
        buffer,
        mime: file.type || "application/octet-stream",
        size: file.size,
        originalFilename: file.name || "upload.bin",
        context: enrichedContext,
      });

      return successResponse({
        bucket: result.bucket,
        path: result.path,
        publicUrl: result.publicUrl,
        signedUrl: result.signedUrl,
        mime: result.mime,
        size: result.size,
      });
    });
  } catch (error) {
    return handleApiError(error);
  }
}
