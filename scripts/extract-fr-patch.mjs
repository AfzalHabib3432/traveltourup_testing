import fs from "node:fs";

const s = fs.readFileSync("scripts/apply-message-translations.mjs", "utf8");
const needle = 'writeLocale("fr", (d) => {';
const start = s.indexOf(needle);
if (start < 0) throw new Error("needle not found");
let depth = 0;
const openBrace = s.indexOf("{", start);
for (let k = openBrace; k < s.length; k++) {
  const ch = s[k];
  if (ch === "{") depth++;
  else if (ch === "}") {
    depth--;
    if (depth === 0) {
      const body = s.slice(openBrace + 1, k);
      fs.mkdirSync("scripts/locale-patches", { recursive: true });
      fs.writeFileSync(
        "scripts/locale-patches/fr.mjs",
        `export default function patchFR(d) {${body}}\n`,
      );
      console.log("OK", body.length);
      process.exit(0);
    }
  }
}
throw new Error("brace mismatch");
