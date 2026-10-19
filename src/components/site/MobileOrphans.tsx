import { useLayoutEffect } from "react";
import { bindSingleLetters } from "@/lib/sierotki";

const MOBILE_QUERY = "(max-width: 63.99rem)";
const SKIP_SELECTOR =
  "script, style, noscript, textarea, input, select, code, pre, [contenteditable='true']";

type Entry = { original: string; fixed: string };

/**
 * Na mobile nie pozwala, by pojedyncza litera (i, w, z…) kończyła wiersz.
 * Zmienia tylko wartości węzłów tekstowych; na desktopie przywraca oryginał.
 */
export function MobileOrphans() {
  useLayoutEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const entries = new WeakMap<Text, Entry>();

    const fixNode = (node: Text) => {
      const value = node.nodeValue ?? "";
      if (entries.get(node)?.fixed === value) return;
      if (node.parentElement?.closest(SKIP_SELECTOR)) return;
      const fixed = bindSingleLetters(value);
      if (fixed === value) {
        entries.delete(node);
        return;
      }
      entries.set(node, { original: value, fixed });
      node.nodeValue = fixed;
    };

    const restoreNode = (node: Text) => {
      const entry = entries.get(node);
      if (!entry) return;
      if (node.nodeValue === entry.fixed) node.nodeValue = entry.original;
      entries.delete(node);
    };

    const walk = (root: Node, visit: (node: Text) => void) => {
      if (root.nodeType === Node.TEXT_NODE) {
        visit(root as Text);
        return;
      }
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        visit(n as Text);
      }
    };

    const observer = new MutationObserver((records) => {
      if (!query.matches) return;
      for (const record of records) {
        if (record.type === "characterData") {
          fixNode(record.target as Text);
        } else {
          record.addedNodes.forEach((node) => walk(node, fixNode));
        }
      }
    });

    const sync = () => {
      walk(document.body, query.matches ? fixNode : restoreNode);
    };

    sync();
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    query.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", sync);
    };
  }, []);

  return null;
}
