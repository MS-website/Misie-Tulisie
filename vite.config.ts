import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import netlify from "@netlify/vite-plugin-tanstack-start";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { normalizeLayout } from "./src/lib/uklad-data";

const layoutFile = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "src/uklad.json",
);

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
            : "{}";
          let payload = raw;
          try {
            const layout = normalizeLayout(JSON.parse(raw));
            delete layout["/dla-rodzicow"];
            payload = JSON.stringify(layout);
          } catch {
            payload = raw;
          }
          res.setHeader("Content-Type", "application/json");
          res.end(payload);
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
            delete layout["/dla-rodzicow"];
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

export default defineConfig({
  server: {
    watch: {
      ignored: ["**/src/uklad.json"],
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    layoutSavePlugin(),
    devFaviconCacheReset(),
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
    }),
    // Edge Functions emulacja pada na Deno 2.9.6+ (--allow-scripts vs deno eval); SSR idzie na Functions.
    netlify({
      dev: { edgeFunctions: { enabled: false } },
    }),
    viteReact(),
  ],
});
