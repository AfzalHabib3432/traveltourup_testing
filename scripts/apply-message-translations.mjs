/**
 * Applies translations to messages/fr.json, ru.json, ar.json, ur.json
 * from canonical messages/en.json (same keys / shape).
 * Run: node scripts/apply-message-translations.mjs
 */
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import patchFR from "./locale-patches/fr.mjs";
import patchRU from "./locale-patches/ru.mjs";
import patchAR from "./locale-patches/ar.mjs";
import patchUR from "./locale-patches/ur.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const messagesDir = join(root, "messages");

const en = JSON.parse(readFileSync(join(messagesDir, "en.json"), "utf8"));

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

/** @param {(d: typeof en) => void} fn */
function writeLocale(code, fn) {
  const data = clone(en);
  fn(data);
  writeFileSync(join(messagesDir, `${code}.json`), JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`Wrote messages/${code}.json`);
}

writeLocale("fr", patchFR);
writeLocale("ru", patchRU);
writeLocale("ar", patchAR);
writeLocale("ur", patchUR);
