/**
 * Merges scripts/locale-patches/breadcrumb/en.json into messages/en.json.
 * Usage: node scripts/merge-breadcrumb-into-en.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const msgDir = join(root, "messages");
const crumb = JSON.parse(
  readFileSync(join(root, "scripts/locale-patches/breadcrumb/en.json"), "utf8"),
);
const enPath = join(msgDir, "en.json");
const en = JSON.parse(readFileSync(enPath, "utf8"));
Object.assign(en, crumb);
writeFileSync(enPath, JSON.stringify(en, null, 2) + "\n", "utf8");
console.log("Merged breadcrumb/en.json into messages/en.json");
