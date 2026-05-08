import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));

/** @param {Record<string, unknown>} d */
export function patchBreadcrumbLocale(d, code) {
  const path = join(dir, `${code}.json`);
  const data = JSON.parse(readFileSync(path, "utf8"));
  Object.assign(d, data);
}
