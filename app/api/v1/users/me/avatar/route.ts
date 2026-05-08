import { NextResponse } from "next/server";
import { getServerAuthz } from "@/lib/authz/session";
import { assertUserId } from "@/lib/authz/server";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";
import { AppError } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import { requireStorageVariant } from "@/lib/storage/registry";
import { uploadToStorage, deleteFromStorage, getSignedDownloadUrl } from "@/lib/storage/service";
import { setMyAvatarPath } from "@/lib/services/user/user.service";

export const dynamic = "force-dynamic";

const VARIANT_ID = "user-avatar";

/** Redirect to a time-limited signed URL for <img src="..."> */
export async function GET() {
  try {
    const { userId } = await getServerAuthz();
    assertUserId(userId);

    const profile = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar_path: true },
    });

    if (!profile?.avatar_path) {
      return NextResponse.json({ success: false as const, code: "NOT_FOUND", message: "No avatar" }, { status: 404 });
    }

    const v = requireStorageVariant(VARIANT_ID);
    const signed = await getSignedDownloadUrl({ variant: v, path: profile.avatar_path });
    return NextResponse.redirect(signed);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await getServerAuthz();
    assertUserId(userId);

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new AppError(400, "Expected multipart field \"file\"", "VALIDATION_ERROR");
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const result = await uploadToStorage({
      variantId: VARIANT_ID,
      buffer: buf,
      mime: file.type || "application/octet-stream",
      size: file.size,
      originalFilename: file.name || "avatar",
      context: { userId },
    });

    const profile = await setMyAvatarPath(userId, result.path);
    return successResponse({ avatar_path: profile.avatar_path }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const { userId } = await getServerAuthz();
    assertUserId(userId);

    const profile = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar_path: true },
    });

    if (profile?.avatar_path) {
      const v = requireStorageVariant(VARIANT_ID);
      await deleteFromStorage({ variant: v, path: profile.avatar_path });
    }

    await setMyAvatarPath(userId, null);
    return successResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
