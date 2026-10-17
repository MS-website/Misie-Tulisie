import { execSync } from "node:child_process";

const ports = [3000, 3001, 5173];
for (const port of ports) {
  try {
    execSync(`open "http://localhost:${port}/__uklad-sync"`, { stdio: "ignore" });
    console.log(
      `Otworzyłem http://localhost:${port}/__uklad-sync w domyślnej przeglądarce.`,
    );
    console.log(
      "Jeśli widzisz „Zapisano” z wieloma tysiącami znaków, układ jest w src/uklad.json — daj znać, żeby wypchnąć na Git.",
    );
    process.exit(0);
  } catch {
    /* try next port */
  }
}
console.error(
  "Uruchom najpierw npm run dev, potem ponów npm run uklad:sync.",
);
process.exit(1);
