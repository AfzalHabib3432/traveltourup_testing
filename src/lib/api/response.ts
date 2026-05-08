import { NextResponse } from "next/server";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true as const, data }, { status });
}

export function paginatedResponse<T>(
  items: T[],
  meta: { total: number; page: number; limit: number },
) {
  const totalPages = meta.limit > 0 ? Math.ceil(meta.total / meta.limit) : 0;
  return NextResponse.json({
    success: true as const,
    data: items,
    meta: {
      ...meta,
      totalPages,
    },
  });
}
