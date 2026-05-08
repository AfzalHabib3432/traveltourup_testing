import { NextRequest } from "next/server";
import { AppError } from "@/lib/api/errors";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";
import { withAuthedRoute, withPermissionRoute } from "@/lib/api/with-route-auth";
import { storageVariantIdSchema, requireStorageVariant } from "@/lib/storage/registry";
import { getSignedDownloadUrl } from "@/lib/storage/service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const variantRaw = searchParams.get("variant");
    const path = searchParams.get("path");

    const variantId = storageVariantIdSchema.safeParse(variantRaw ?? "");
    if (!variantId.success) {
      throw new AppError(400, "Invalid or missing storage variant", "STORAGE_VARIANT_INVALID");
    }
    if (!path) {
      throw new AppError(400, "Missing path parameter", "VALIDATION");
    }

    const v = requireStorageVariant(variantId.data);
    if (v.visibility !== "private") {
      throw new AppError(400, "Signed URLs are only available for private variants", "STORAGE_NOT_PRIVATE");
    }

    const routeWrapper = v.selfService
      ? withAuthedRoute
      : (handler: (ctx: { userId: string }) => Promise<Response>) =>
          withPermissionRoute(v.writePermission, handler);

    return await routeWrapper(async () => {
      const signedUrl = await getSignedDownloadUrl({ variant: v, path });
      return successResponse({ signedUrl });
    });
  } catch (error) {
    return handleApiError(error);
  }
}
