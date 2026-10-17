/**
 * Wklej z przeglądarki: localStorage.getItem("misie-uklad-v1")
 * do pliku JSON, potem: node scripts/import-uklad.mjs ścieżka/do/exportu.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "src", "uklad.json");
const source = process.argv[2];

if (!source) {
  console.error(
    "Użycie: node scripts/import-uklad.mjs <plik-z-localStorage.json>",
  );
  process.exit(1);
}

const raw = fs.readFileSync(path.resolve(source), "utf8");
let layout;
try {
  layout = JSON.parse(raw);
} catch {
  console.error("Plik nie jest poprawnym JSON.");
  process.exit(1);
}

if (layout == null || typeof layout !== "object" || Array.isArray(layout)) {
  console.error("Oczekiwany obiekt układu (jak misie-uklad-v1).");
  process.exit(1);
}

fs.writeFileSync(target, `${JSON.stringify(layout, null, 2)}\n`);
console.log(`Zapisano ${target}`);
console.log(
  "Następnie: git add src/uklad.json && git commit && git push — dopiero wtedy Vercel zobaczy układ.",
);
