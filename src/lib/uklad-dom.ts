import type { Box, SizeId, Store } from "./uklad-data";

const applied = new WeakMap<Document, Set<string>>();
let applying = false;

export function isHtmlElement(
  node: EventTarget | null | undefined,
): node is HTMLElement {
  return (
    !!node && (node as Node).nodeType === 1 && "style" in (node as Element)
  );
}

export function isApplying() {
  return applying;
}

export function clearBox(el: HTMLElement) {
  el.style.translate = "";
  el.style.zIndex = "";
  el.style.paddingTop = "";
  el.style.paddingBottom = "";
  el.style.marginTop = "";
  el.style.marginBottom = "";
  if (el.dataset["layoutPosition"] === "1") {
    el.style.position = "";
    delete el.dataset["layoutPosition"];
  }
}

function applyBox(el: HTMLElement, box: Box) {
  if (el.isContentEditable) return;
  el.style.translate = box.x || box.y ? `${box.x}px ${box.y}px` : "";
  if (getComputedStyle(el).position === "static") {
    el.style.position = "relative";
    el.dataset["layoutPosition"] = "1";
  }
  el.style.zIndex = box.z > 0 ? String(box.z) : "";
  el.style.paddingTop = box.paddingTop != null ? `${box.paddingTop}px` : "";
  el.style.paddingBottom =
    box.paddingBottom != null ? `${box.paddingBottom}px` : "";
  el.style.marginTop = box.marginTop != null ? `${box.marginTop}px` : "";
  el.style.marginBottom =
    box.marginBottom != null ? `${box.marginBottom}px` : "";
}

export function applyLayout(
  doc: Document,
  pathname: string,
  size: SizeId,
  store: Store,
) {
  if (applying) return false;
  const main = doc.querySelector("main");
  if (!main) return false;
  const page = store[pathname];
  const boxes = page?.[size] ?? {};
  const texts = page?.text ?? {};
  const previous = applied.get(doc) ?? new Set<string>();
  let normalized = false;
  applying = true;
  try {
    const next = new Set<string>([
      ...Object.keys(boxes),
      ...Object.keys(texts),
    ]);
    for (const selector of previous) {
      if (next.has(selector)) continue;
      const el = main.querySelector(selector);
      if (isHtmlElement(el)) clearBox(el);
    }
    for (const [selector, text] of Object.entries(texts)) {
      const el = main.querySelector(selector);
      if (!isHtmlElement(el) || el.isContentEditable) continue;
      if (el.innerHTML !== text.html) {
        el.innerHTML = text.html;
        if (el.innerHTML !== text.html) {
          text.html = el.innerHTML;
          normalized = true;
        }
      }
    }
    for (const selector of Object.keys(texts)) {
      if (boxes[selector]) continue;
      const el = main.querySelector(selector);
      if (isHtmlElement(el)) clearBox(el);
    }
    for (const [selector, box] of Object.entries(boxes)) {
      const el = main.querySelector(selector);
      if (isHtmlElement(el)) applyBox(el, box);
    }
    applied.set(doc, next);
    return normalized;
  } finally {
    applying = false;
  }
}
