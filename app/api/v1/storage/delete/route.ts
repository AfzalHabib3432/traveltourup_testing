import { NextRequest } from "next/server";
import { z } from "zod";
import { AppError } from "@/lib/api/errors";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";
import { withAuthedRoute, withPermissionRoute } from "@/lib/api/with-route-auth";
import { storageVariantIdSchema, requireStorageVariant } from "@/lib/storage/registry";
import { deleteFromStorage } from "@/lib/storage/service";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  variant: storageVariantIdSchema,
  path: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      throw new AppError(400, "Expected JSON body", "VALIDATION");
    }
    const body = bodySchema.parse(json);
    const v = requireStorageVariant(body.variant);

    const routeWrapper = v.selfService
      ? withAuthedRoute
      : (handler: (ctx: { userId: string }) => Promise<Response>) =>
          withPermissionRoute(v.writePermission, handler);

    return await routeWrapper(async () => {
      await deleteFromStorage({ variant: v, path: body.path });
      return successResponse({ ok: true as const });
    });
  } catch (error) {
    return handleApiError(error);
  }
}
