import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { nitro } from "nitro/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { normalizeLayout } from "./src/lib/uklad-data";

const layoutFile = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "src/uklad.json",
);

const parentsTuneFile = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "src/parents-layout-tune.json",
);

function enrollmentCardDownload(): Plugin {
  return {
    name: "enrollment-card-download",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split("?")[0];
        if (pathname === "/karta-zgloszenia-dziecka.pdf") {
          res.setHeader(
            "Content-Disposition",
            'attachment; filename="karta-zgloszenia-dziecka.pdf"',
          );
        }
        next();
      });
    },
  };
}

function normalizeParentsTuneFile(value: unknown) {
  const empty = { offsets: {} as Record<string, unknown>, text: {} as Record<string, string> };
  if (!value || typeof value !== "object") return empty;
  const record = value as Record<string, unknown>;
  if ("offsets" in record || "text" in record) {
    return {
      offsets: (record.offsets ?? {}) as Record<string, unknown>,
      text: (record.text ?? {}) as Record<string, string>,
    };
  }
  return { offsets: record, text: {} };
}

function parentsTuneSavePlugin(): Plugin {
  return {
    name: "parents-tune-save",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split("?")[0];
        if (pathname === "/__parents-tune" && req.method === "GET") {
          const raw = fs.existsSync(parentsTuneFile)
            ? fs.readFileSync(parentsTuneFile, "utf8")
            : "{}\n";
          res.setHeader("Content-Type", "application/json");
          res.end(raw);
          return;
        }
        if (pathname !== "/__parents-tune" || req.method !== "POST") {
          next();
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        req.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > 200_000) {
            res.statusCode = 413;
            res.end();
            req.destroy();
            return;
          }
          chunks.push(chunk);
        });
        req.on("end", () => {
          try {
            const store = normalizeParentsTuneFile(
              JSON.parse(Buffer.concat(chunks).toString("utf8")),
            );
            fs.writeFileSync(
              parentsTuneFile,
              `${JSON.stringify(store, null, 2)}\n`,
            );
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          } catch {
            res.statusCode = 400;
            res.end();
          }
        });
      });
    },
  };
}

function layoutSavePlugin(): Plugin {
  return {
    name: "uklad-save",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split("?")[0];
        if (pathname === "/__uklad" && req.method === "GET") {
          const raw = fs.existsSync(layoutFile)
            ? fs.readFileSync(layoutFile, "utf8")
            : "{}\n";
          res.setHeader("Content-Type", "application/json");
          res.end(raw);
          return;
        }
        if (pathname === "/__uklad-sync" && req.method === "GET") {
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(`<!DOCTYPE html>
<html lang="pl">
<head><meta charset="utf-8"/><title>Synchronizacja układu</title></head>
<body>
<pre id="status">Synchronizacja z localStorage do src/uklad.json…</pre>
<script>
(async () => {
  const status = document.getElementById("status");
  const raw = localStorage.getItem("misie-uklad-v1");
  if (!raw) {
    status.textContent =
      "Brak misie-uklad-v1 w tej przeglądarce. Otwórz tę stronę w oknie, w którym edytowałeś układ (localhost).";
    return;
  }
  try {
    const response = await fetch("/__uklad", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: raw,
    });
    if (!response.ok) throw new Error("HTTP " + response.status);
    await response.json();
    status.textContent =
      "Zapisano src/uklad.json (" + raw.length + " znaków). Możesz zamknąć kartę.";
  } catch (error) {
    status.textContent = "Błąd zapisu: " + error;
  }
})();
</script>
</body>
</html>`);
          return;
        }
        if (pathname !== "/__uklad" || req.method !== "POST") {
          next();
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        req.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > 1_000_000) {
            res.statusCode = 413;
            res.end();
            req.destroy();
            return;
          }
          chunks.push(chunk);
        });
        req.on("end", () => {
          try {
            const layout = normalizeLayout(
              JSON.parse(Buffer.concat(chunks).toString("utf8")),
            );
            fs.writeFileSync(
              layoutFile,
              `${JSON.stringify(layout, null, 2)}\n`,
            );
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          } catch {
            res.statusCode = 400;
            res.end();
          }
        });
      });
    },
  };
}

function devFaviconCacheReset(): Plugin {
  return {
    name: "dev-favicon-cache-reset",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const accept = req.headers.accept;
        const header = Array.isArray(accept)
          ? accept.join(",")
          : (accept ?? "");
        if (header.includes("text/html")) {
          res.setHeader("Clear-Site-Data", '"cache"');
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const web3formsKey =
    env.VITE_WEB3FORMS_ACCESS_KEY ?? process.env.VITE_WEB3FORMS_ACCESS_KEY ?? "";

  return {
  server: {
    watch: {
      ignored: ["**/src/uklad.json", "**/src/parents-layout-tune.json"],
    },
  },
  define: {
    "import.meta.env.VITE_WEB3FORMS_ACCESS_KEY": JSON.stringify(web3formsKey),
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    enrollmentCardDownload(),
    parentsTuneSavePlugin(),
    layoutSavePlugin(),
    devFaviconCacheReset(),
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
    }),
    viteReact(),
    nitro({
      routeRules: {
        "/formularz-rekrutacyjny": {
          redirect: { to: "/rekrutacja", status: 301 },
        },
        "/karta-zgloszenia-dziecka.pdf": {
          headers: {
            "Content-Disposition":
              'attachment; filename="karta-zgloszenia-dziecka.pdf"',
          },
        },
      },
    }),
  ],
};
});
