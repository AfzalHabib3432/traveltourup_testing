/** Same page size as flight results for consistent UX. */
export const HOTEL_RESULTS_PAGE_SIZE = 10;

/** Available room rate cards on hotel detail (smaller page than search results). */
export const AVAILABLE_ROOMS_PAGE_SIZE = 5;

/** Page numbers with ellipses for large page counts (1-based). */
export function getHotelResultsPaginationRange(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const result: (number | "ellipsis")[] = [];
  /** First window: show pages 1–3 (not 1–5) before ellipsis. */
  if (current <= 3) {
    for (let i = 1; i <= 3; i++) result.push(i);
    result.push("ellipsis", total);
  } else if (current >= total - 2) {
    result.push(1, "ellipsis");
    /** Last window: three trailing page numbers (not five). */
    for (let i = total - 2; i <= total; i++) result.push(i);
  } else {
    result.push(1, "ellipsis", current - 1, current, current + 1, "ellipsis", total);
  }
  return result;
}
