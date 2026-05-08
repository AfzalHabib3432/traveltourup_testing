/** Parse ISO-8601 duration fragment from Duffel (e.g. PT7H30M) to minutes; best-effort. */
export function parseIsoDurationMinutes(iso: string | null | undefined): number {
  if (!iso || typeof iso !== "string") return 0;
  let m = 0;
  const d = iso.match(/(\d+)D/);
  const h = iso.match(/(\d+)H/);
  const min = iso.match(/(\d+)M/);
  if (d) m += parseInt(d[1]!, 10) * 24 * 60;
  if (h) m += parseInt(h[1]!, 10) * 60;
  if (min) m += parseInt(min[1]!, 10);
  return m;
}

/** Total “block” minutes for a slice from segment ISO durations. */
export function sliceDurationMinutes(segments: Array<{ duration?: string | null }>): number {
  return segments.reduce((acc, s) => acc + parseIsoDurationMinutes(s.duration ?? null), 0);
}
