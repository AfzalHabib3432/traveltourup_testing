/**
 * Merges scripts/locale-patches/legal/en.json (PrivacyPage, TermsPage, AboutAchievements)
 * into messages/en.json. Run after editing English legal copy.
 * Usage: node scripts/merge-legal-into-en.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const msgDir = join(root, "messages");
const legalEn = JSON.parse(
  readFileSync(join(root, "scripts/locale-patches/legal/en.json"), "utf8"),
);
const enPath = join(msgDir, "en.json");
const en = JSON.parse(readFileSync(enPath, "utf8"));
Object.assign(en, legalEn);
writeFileSync(enPath, JSON.stringify(en, null, 2) + "\n", "utf8");
console.log("Merged legal/en.json into messages/en.json");
