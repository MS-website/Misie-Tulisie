import { useLayoutEffect } from "react";
import { applyLayout, applyTheme, isApplying } from "@/lib/uklad-dom";
import { sizeForWidth } from "@/lib/uklad-data";
import { useLayoutPathname } from "@/lib/uklad-pathname";
import { useUkladStore } from "@/components/site/UkladText";

export function SavedLayout() {
  const store = useUkladStore();
  const pathname = useLayoutPathname();

  useLayoutEffect(() => {
    let cancelled = false;
    let frame = 0;

    const run = () => {
      if (cancelled) return;
      const size = sizeForWidth(window.innerWidth);
      applyLayout(document, pathname, size, store, {
        text: true,
        boxes: false,
      });
      applyTheme(document, pathname, store);
    };

    run();

    let observer: MutationObserver | null = null;
    const main = document.querySelector("main");
    if (main) {
      const schedule = () => {
        if (cancelled || frame) return;
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          if (cancelled || isApplying()) return;
          run();
        });
      };
      observer = new MutationObserver(() => schedule());
      observer.observe(main, {
        childList: true,
        subtree: true,
        attributes: false,
      });
    }

    const queries = [
      window.matchMedia("(max-width: 767px)"),
      window.matchMedia("(min-width: 1024px)"),
    ];
    for (const query of queries) query.addEventListener("change", run);

    return () => {
      cancelled = true;
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      observer?.disconnect();
      for (const query of queries) query.removeEventListener("change", run);
    };
  }, [pathname, store]);

  return null;
}
