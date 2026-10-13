import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import savedFile from "@/uklad.json";
import { applyLayout, applyTheme, isApplying } from "@/lib/uklad-dom";
import { normalizeLayout, sizeForWidth } from "@/lib/uklad-data";

const store = normalizeLayout(savedFile);

export function SavedLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    const run = () => {
      const size = sizeForWidth(window.innerWidth);
      applyLayout(document, pathname, size, store);
      applyTheme(document, pathname, store);
    };
    run();
    const later = window.setTimeout(run, 80);
    const main = document.querySelector("main");
    const observer = new MutationObserver(() => {
      if (!isApplying()) run();
    });
    if (main) observer.observe(main, { childList: true, subtree: true });
    const queries = [
      window.matchMedia("(max-width: 767px)"),
      window.matchMedia("(min-width: 1024px)"),
    ];
    for (const query of queries) query.addEventListener("change", run);
    return () => {
      window.clearTimeout(later);
      observer.disconnect();
      for (const query of queries) query.removeEventListener("change", run);
    };
  }, [pathname]);

  return null;
}
