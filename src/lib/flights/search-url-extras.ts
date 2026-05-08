import type { FlightSearchBody } from "@/lib/validations/flights.schema";

const HM = /^\d{2}:\d{2}$/;

function windowFromParams(sp: URLSearchParams, prefix: string): { from: string; to: string } | undefined {
  const from = sp.get(`${prefix}_from`)?.trim() ?? "";
  const to = sp.get(`${prefix}_to`)?.trim() ?? "";
  if (!HM.test(from) || !HM.test(to)) return undefined;
  return { from, to };
}

/** Merge `s{i}_dep_*` / `s{i}_arr_*` URL params onto slice list (Duffel time windows). */
export function mergeSliceTimeWindowsFromUrl(
  slices: FlightSearchBody["slices"],
  sp: URLSearchParams,
): FlightSearchBody["slices"] {
  return slices.map((s, i) => {
    const departure_time = windowFromParams(sp, `s${i}_dep`) ?? s.departure_time;
    const arrival_time = windowFromParams(sp, `s${i}_arr`) ?? s.arrival_time;
    return {
      ...s,
      ...(departure_time ? { departure_time } : {}),
      ...(arrival_time ? { arrival_time } : {}),
    };
  });
}

export function parseChildAgesFromUrl(sp: URLSearchParams): number[] {
  const raw = sp.get("child_ages")?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((x) => parseInt(x.trim(), 10))
    .filter((n) => !Number.isNaN(n));
}
