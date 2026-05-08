export function firstNameFromUserMetadata(meta: Record<string, unknown> | undefined): string {
  const first = meta?.first_name;
  if (typeof first === "string" && first.length > 0) return first;
  const full = meta?.full_name;
  if (typeof full === "string" && full.length > 0) return full.split(/\s+/)[0] ?? "Guest";
  const name = meta?.name;
  if (typeof name === "string" && name.length > 0) return name.split(/\s+/)[0] ?? "Guest";
  return "Guest";
}

export function lastNameFromUserMetadata(meta: Record<string, unknown> | undefined): string {
  const last = meta?.last_name;
  if (typeof last === "string") return last;
  const full = meta?.full_name;
  if (typeof full === "string" && full.includes(" ")) {
    const parts = full.split(/\s+/).filter(Boolean);
    return parts.slice(1).join(" ") ?? "";
  }
  const name = meta?.name;
  if (typeof name === "string" && name.includes(" ")) {
    const parts = name.split(/\s+/).filter(Boolean);
    return parts.slice(1).join(" ") ?? "";
  }
  return "";
}
