import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { RouteScrollReset } from "@/components/site/RouteScrollReset";
import { SavedLayout } from "@/components/site/SavedLayout";
import { UkladStoreProvider } from "@/components/site/UkladText";
import { UKLAD_MANUAL_EDITOR_ENABLED } from "@/lib/uklad-editor-enabled";
import appCss from "../styles.css?url";

const FAVICON_PNG = "/brand-icon.png?v=2";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 font-display text-3xl text-foreground">
          Nie znaleziono strony
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ta strona nie istnieje albo została przeniesiona.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Strona główna
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl text-foreground">
          Strona nie załadowała się
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Spróbuj odświeżyć stronę albo wróć na stronę główną.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Spróbuj ponownie
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Strona główna
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
        { rel: "icon", type: "image/png", href: FAVICON_PNG },
        { rel: "apple-touch-icon", href: FAVICON_PNG },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Manrope:wght@400;500;600&display=swap",
        },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function FaviconProbe() {
  useEffect(() => {
    const links = [...document.querySelectorAll('link[rel*="icon"]')].map(
      (el) => ({
        rel: el.getAttribute("rel"),
        href: el.getAttribute("href"),
        type: el.getAttribute("type"),
      }),
    );
    // #region agent log
    fetch("http://127.0.0.1:7272/ingest/eda9603b-a79b-47d5-8ca4-11ac27ee00aa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "b1a893",
      },
      body: JSON.stringify({
        sessionId: "b1a893",
        runId: "post-fix-v3",
        hypothesisId: "H10",
        location: "__root.tsx:FaviconProbe",
        message: "DOM icon links",
        data: {
          links,
          ua: navigator.userAgent,
          origin: location.origin,
          href: location.href,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    for (const url of [FAVICON_PNG, "/favicon.ico", "/vite.svg"]) {
      fetch(url)
        .then(async (res) => {
          const bytes = new Uint8Array(await res.arrayBuffer());
          const hex = [...bytes.slice(0, 8)]
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
          // #region agent log
          fetch(
            "http://127.0.0.1:7272/ingest/eda9603b-a79b-47d5-8ca4-11ac27ee00aa",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Debug-Session-Id": "b1a893",
              },
              body: JSON.stringify({
                sessionId: "b1a893",
                runId: "post-fix-v3",
                hypothesisId: "H10",
                location: "__root.tsx:FaviconProbe",
                message: "Favicon fetch probe",
                data: {
                  url,
                  status: res.status,
                  contentType: res.headers.get("content-type"),
                  hex,
                  len: bytes.length,
                },
                timestamp: Date.now(),
              }),
            },
          ).catch(() => {});
          // #endregion
        })
        .catch(() => {});
    }
  }, []);
  return null;
}

function DevLayoutEditor() {
  const [Tool, setTool] = useState<ComponentType | null>(null);
  const previewFrame =
    typeof window !== "undefined" && window.name === "podglad";

  useEffect(() => {
    if (
      !UKLAD_MANUAL_EDITOR_ENABLED ||
      !import.meta.env.DEV ||
      previewFrame
    )
      return;
    void import("@/components/site/LayoutEditor").then((mod) => {
      setTool(() => mod.LayoutEditor);
    });
  }, [previewFrame]);

  if (!UKLAD_MANUAL_EDITOR_ENABLED || previewFrame || !Tool) return null;
  return <Tool />;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <UkladStoreProvider>
        <RouteScrollReset />
        <FaviconProbe />
        <Header />
        <main className="min-w-0">
          <Outlet />
        </main>
        <Footer />
        <SavedLayout />
        <DevLayoutEditor />
      </UkladStoreProvider>
    </QueryClientProvider>
  );
}
