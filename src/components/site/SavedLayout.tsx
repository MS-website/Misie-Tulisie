import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import savedFile from "@/uklad.json";
import { applyLayout, applyTheme, isApplying } from "@/lib/uklad-dom";
import { normalizeLayout, sizeForWidth, type Store } from "@/lib/uklad-data";

const bundledStore = normalizeLayout(savedFile);

export function SavedLayout() {
  const [store, setStore] = useState<Store>(bundledStore);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    void fetch("/__uklad")
      .then(async (response) => {
        if (!response.ok) return;
        setStore(normalizeLayout(await response.json()));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const run = () => {
      const size = sizeForWidth(window.innerWidth);
      applyLayout(document, pathname, size, store);
      if (pathname !== "/dla-rodzicow") applyTheme(document, pathname, store);
    };
    run();
    const later = window.setTimeout(run, 80);
    const main = document.querySelector("main");
    let frame = 0;
    let observer: MutationObserver | null = null;
    if (main) {
      const schedule = () => {
        if (frame) return;
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          if (!isApplying()) run();
        });
      };
      observer = new MutationObserver(() => schedule());
      observer.observe(main, { childList: true, subtree: true, attributes: false });
    }
    const queries = [
      window.matchMedia("(max-width: 767px)"),
      window.matchMedia("(min-width: 1024px)"),
    ];
    for (const query of queries) query.addEventListener("change", run);
    return () => {
      window.clearTimeout(later);
      observer?.disconnect();
      for (const query of queries) query.removeEventListener("change", run);
    };
  }, [pathname, store]);

  return null;
}
