import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

function scrollToTopInstant() {
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.style.scrollBehavior = previous;
}

export function RouteScrollReset() {
  const router = useRouter();

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "auto";

    return router.subscribe("onRendered", ({ fromLocation, pathChanged, toLocation }) => {
      if (!fromLocation || !pathChanged) return;
      const hash = toLocation.hash;
      if (hash) {
        const id = decodeURIComponent(hash.slice(1));
        const target = document.getElementById(id);
        if (target) {
          const root = document.documentElement;
          const previous = root.style.scrollBehavior;
          root.style.scrollBehavior = "auto";
          target.scrollIntoView({ block: "start" });
          root.style.scrollBehavior = previous;
          return;
        }
      }
      scrollToTopInstant();
      requestAnimationFrame(scrollToTopInstant);
    });
  }, [router]);

  return null;
}
