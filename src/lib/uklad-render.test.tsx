import { createMemoryHistory } from "@tanstack/history";
import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import savedFile from "@/uklad.json";
import { normalizeLayout } from "@/lib/uklad-data";
import { applyLayout, buildLayoutStylesheet } from "@/lib/uklad-dom";
import { routeTree } from "@/routeTree.gen";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

class TestObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
vi.stubGlobal("IntersectionObserver", TestObserver);

const store = normalizeLayout(savedFile);

function plain(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function plainFromSavedHtml(html: string) {
  return plain(
    html
      .replace(/&nbsp;/gi, " ")
      .replace(/&#160;/gi, " ")
      .replace(/<[^>]+>/g, " "),
  ).replace(/\s+([,.;:!?])/g, "$1");
}

/** Porównanie treści po applyLayout — ignoruje różnice spacji wstawianych przez parser/tagi. */
function compactText(value: string) {
  return plain(value).replace(/\s+/g, "");
}

async function pageRouter(pathname: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [pathname] }),
    context: { queryClient: new QueryClient() },
  });
  await router.load();
  return router;
}

describe("paint układu", () => {
  it("dla podstrony generuje CSS tej ścieżki, nie strony głównej", async () => {
    const router = await pageRouter("/o-nas");
    const html = renderToStaticMarkup(<RouterProvider router={router} />);
    const css = buildLayoutStylesheet("/o-nas", store);
    expect(css).toContain("translate:0px -108px");
    expect(css).not.toContain("--home-card-fill");
    expect(html).toContain('id="uklad-paint"');
    expect(html).toContain("translate:0px -108px");
    expect(html).not.toContain("--home-card-fill");
  });
});

describe("zapisany tekst w pierwszym HTML-u", () => {
  it("wstawia różniące się fragmenty, których selektor istnieje w drzewie", async () => {
    const pages = [
      "/",
      "/o-nas",
      "/rekrutacja",
      "/aktywny-maluch",
      "/galeria",
      "/kontakt",
    ];
    let present = 0;
    let absent = 0;
    let differingOnPages = 0;
    for (const pathname of pages) {
      const router = await pageRouter(pathname);
      // SSR daje strukturę DOM; tekst z selektorów CSS nakłada SavedLayout po stronie klienta.
      const html = renderToStaticMarkup(<RouterProvider router={router} />);
      const doc = new DOMParser().parseFromString(html, "text/html");
      const main = doc.querySelector("main");
      expect(main, pathname).not.toBeNull();
      applyLayout(doc, pathname, "lg", store, { text: true, boxes: false });
      for (const [selector, text] of Object.entries(store[pathname]?.text ?? {})) {
        if (text.html === text.originalHtml) continue;
        differingOnPages += 1;
        const el = main?.querySelector(selector);
        if (!el) {
          absent += 1;
          continue;
        }
        present += 1;
        if (text.html === "<br>") {
          expect(plain(el.textContent ?? ""), `${pathname} ${selector}`).toBe("");
        } else {
          // Parser może wynieść <div> z <p>; treść zapisana ma być w zakresie rodzica.
          const expected = compactText(plainFromSavedHtml(text.html));
          const scope = el.parentElement ?? el;
          expect(
            compactText(scope.textContent ?? ""),
            `${pathname} ${selector}`,
          ).toContain(expected);
        }
      }
    }
    expect(differingOnPages).toBeGreaterThan(0);
    expect(present).toBeGreaterThan(0);
    expect(present + absent).toBe(differingOnPages);
  });

  it("nie przywraca starego tekstu po przejściu między podstronami i hydratuje bez ostrzeżenia", async () => {
    const errors: string[] = [];
    const previous = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(args.map(String).join(" "));
    };
    const router = await pageRouter("/");
    const html = renderToString(<RouterProvider router={router} />);
    document.open();
    document.write(html);
    document.close();
    const clientRouter = await pageRouter("/");
    let root: ReturnType<typeof hydrateRoot> | undefined;
    const onWindowError = (event: ErrorEvent) => {
      errors.push(event.message);
      event.preventDefault();
    };
    window.addEventListener("error", onWindowError);
    try {
      await act(async () => {
        root = hydrateRoot(document, <RouterProvider router={clientRouter} />);
      });
      await act(async () => {
        await clientRouter.navigate({ to: "/kontakt" });
      });
      const paint = document.getElementById("uklad-paint")?.textContent ?? "";
      expect(paint.includes("--home-card-fill")).toBe(false);
      expect(paint).toContain("padding-bottom:48px");
      expect(document.querySelector("main h1")?.textContent).toBe(
        "Zapraszamy do kontaktu",
      );
      await act(async () => {
        await clientRouter.navigate({ to: "/galeria" });
      });
      expect(plain(document.querySelector("main h1")?.textContent ?? "")).toBe(
        "Galeria żłobka Misie Tulisie w Gnieźnie",
      );
      await act(async () => {
        await clientRouter.navigate({ to: "/o-nas" });
      });
      const paintOnas =
        document.getElementById("uklad-paint")?.textContent ?? "";
      expect(paintOnas).toContain("translate:0px -108px");
      expect(document.querySelector("main h1")?.textContent).toBe(
        "Ciepło, spokój i uważność",
      );
    } finally {
      window.removeEventListener("error", onWindowError);
      root?.unmount();
      console.error = previous;
    }
    const hydration = errors.filter((message) =>
      /hydrat|did not match|didn't match/i.test(message),
    );
    const outsideHead = hydration.filter(
      (message) => !/stylesheet|href/i.test(message),
    );
    expect(outsideHead).toEqual([]);
  });
});
