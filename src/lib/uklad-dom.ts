import {
  SIZE_ORDER,
  cardFillCss,
  cardFillFor,
  discoverFillFor,
  type Box,
  type SizeId,
  type Store,
} from "./uklad-data";
import { UKLAD_MANUAL_EDITOR_ENABLED } from "./uklad-editor-enabled";

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

const LINE_MARK = "data-uklad-line";
export const UKLAD_TEXT_CONTINUE = "data-uklad-text-continue";

const SIZE_MEDIA: Record<SizeId, string> = {
  sm: "@media (max-width: 767px)",
  md: "@media (min-width: 768px) and (max-width: 1023px)",
  lg: "@media (min-width: 1024px)",
};

function textContinuations(el: HTMLElement) {
  const nodes: HTMLElement[] = [];
  let next = el.nextElementSibling;
  while (
    next instanceof HTMLElement &&
    next.getAttribute(UKLAD_TEXT_CONTINUE) === "true"
  ) {
    nodes.push(next);
    next = next.nextElementSibling;
  }
  return nodes;
}

function resetBoxStyles(el: HTMLElement) {
  el.style.translate = "";
  el.style.zIndex = "";
  for (const prop of [
    "padding-top",
    "padding-bottom",
    "margin-top",
    "margin-bottom",
  ] as const) {
    el.style.removeProperty(prop);
  }
  el.style.fontSize = "";
  el.style.width = "";
  el.style.maxWidth = "";
  el.style.height = "";
  el.style.maxHeight = "";
  el.style.aspectRatio = "";
  clearLines(el);
  if (el.dataset["layoutHidden"] === "1") {
    el.style.display = el.dataset["layoutHiddenDisplay"] ?? "";
    el.removeAttribute("hidden");
    delete el.dataset["layoutHidden"];
    delete el.dataset["layoutHiddenDisplay"];
  }
  if (el.dataset["layoutPosition"] === "1") {
    el.style.position = "";
    delete el.dataset["layoutPosition"];
  }
  if (el.dataset["layoutDisplay"] === "1") {
    el.style.display = "";
    delete el.dataset["layoutDisplay"];
  }
}

function clearContinuations(el: HTMLElement) {
  for (const node of textContinuations(el)) resetBoxStyles(node);
}

function anchorSelector(selector: string) {
  return />\s*a:nth-of-type\(\d+\)$/.test(selector);
}

function boxCssLines(box: Box, selector: string, continuation = false) {
  const lines: string[] = [];
  const hasOffset = !!(box.x || box.y);
  if (!continuation && hasOffset && anchorSelector(selector)) {
    lines.push("display:inline-block");
  }
  if (!continuation && (hasOffset || box.z > 0)) {
    lines.push("position:relative");
  }
  if (continuation) {
    lines.push("display:block");
    lines.push("margin-top:0!important");
    if (box.x) lines.push(`translate:${box.x}px 0px`);
  } else if (hasOffset) {
    lines.push(`translate:${box.x}px ${box.y}px`);
  }
  if (!continuation && box.z > 0) lines.push(`z-index:${box.z}`);
  if (!continuation && box.paddingTop != null) {
    lines.push(`padding-top:${box.paddingTop}px !important`);
  }
  if (!continuation && box.paddingBottom != null) {
    lines.push(`padding-bottom:${box.paddingBottom}px !important`);
  }
  if (!continuation && box.marginTop != null) {
    lines.push(`margin-top:${box.marginTop}px !important`);
  }
  if (!continuation && box.marginBottom != null) {
    lines.push(`margin-bottom:${box.marginBottom}px !important`);
  }
  if (box.fontSize != null) lines.push(`font-size:${box.fontSize}px`);
  if (box.width != null) {
    lines.push(`width:${box.width}px`);
    lines.push(`max-width:${box.width}px`);
  }
  if (!continuation && box.height != null) {
    lines.push(`height:${box.height}px`);
    lines.push(`max-height:${box.height}px`);
    if (box.width != null) lines.push("aspect-ratio:auto");
  }
  return lines;
}

function continuationSelectorRules(selector: string, box: Box) {
  const cont = boxCssLines(box, selector, true);
  if (cont.length === 0) return [];
  const base = `main ${selector}`;
  const body = cont.join(";");
  const contSel = `[${UKLAD_TEXT_CONTINUE}="true"]`;
  return [
    `${base} + ${contSel}{${body}}`,
    `${base} + ${contSel} + ${contSel}{${body}}`,
  ];
}

export function buildLayoutStylesheet(pathname: string, store: Store) {
  const page = store[pathname];
  if (!page) return "";
  const chunks: string[] = [];
  if (pathname === "/") {
    chunks.push(
      `:root{--home-card-fill:${cardFillCss(cardFillFor(store, pathname))};--home-discover-fill:${cardFillCss(discoverFillFor(store, pathname))};}`,
    );
  }
  for (const size of SIZE_ORDER) {
    const boxes = page[size];
    if (!boxes || Object.keys(boxes).length === 0) continue;
    const rules: string[] = [];
    for (const [selector, box] of Object.entries(boxes)) {
      const main = boxCssLines(box, selector, false);
      if (main.length > 0) {
        rules.push(`main ${selector}{${main.join(";")}}`);
      }
      rules.push(...continuationSelectorRules(selector, box));
    }
    if (rules.length > 0) {
      chunks.push(`${SIZE_MEDIA[size]}{${rules.join("")}}`);
    }
  }
  return chunks.join("");
}

export type WordRange = { node: Text; start: number; end: number };

function ensureLayoutInlineBox(el: HTMLElement) {
  const display = getComputedStyle(el).display;
  const inlineTag = el.tagName === "A" || el.tagName === "BUTTON";
  if (!inlineTag && display !== "inline" && display !== "contents") return;
  const flexButton =
    inlineTag &&
    (display.includes("flex") || el.classList.contains("inline-flex"));
  el.style.display = flexButton ? "inline-flex" : "inline-block";
  el.dataset["layoutDisplay"] = "1";
}

export function clearBox(el: HTMLElement) {
  clearContinuations(el);
  resetBoxStyles(el);
}

function applyContinuationStyles(el: HTMLElement, box: Box) {
  if (box.fontSize != null) el.style.fontSize = `${box.fontSize}px`;
  if (box.width != null) {
    el.style.width = `${box.width}px`;
    el.style.maxWidth = `${box.width}px`;
  }
  if (box.x) el.style.translate = `${box.x}px 0px`;
  else if (!box.y) el.style.translate = "";
}

export function wordRanges(el: HTMLElement): WordRange[] {
  const words: WordRange[] = [];
  const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    const node = current as Text;
    const text = node.data;
    const pattern = /\S+/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text))) {
      words.push({
        node,
        start: match.index,
        end: match.index + match[0].length,
      });
    }
    current = walker.nextNode();
  }
  return words;
}

export function linesFromBreaks(wordCount: number, breaks: number[]) {
  if (wordCount <= 0) return [];
  const points = [...new Set(breaks)]
    .filter(
      (index) => Number.isInteger(index) && index >= 0 && index < wordCount - 1,
    )
    .sort((a, b) => a - b);
  const lines: number[][] = [];
  let start = 0;
  for (const point of points) {
    const line: number[] = [];
    for (let index = start; index <= point; index += 1) line.push(index);
    lines.push(line);
    start = point + 1;
  }
  if (start < wordCount) {
    const tail: number[] = [];
    for (let index = start; index < wordCount; index += 1) tail.push(index);
    lines.push(tail);
  }
  return lines;
}

export function breaksFromLines(lines: number[][]) {
  const breaks: number[] = [];
  for (let index = 0; index < lines.length - 1; index += 1) {
    const line = lines[index];
    const last = line?.[line.length - 1];
    if (typeof last === "number") breaks.push(last);
  }
  return breaks;
}

export function moveLineWord(
  wordCount: number,
  breaks: number[],
  lineIndex: number,
  direction: -1 | 1,
) {
  const lines = linesFromBreaks(wordCount, breaks);
  const line = lines[lineIndex];
  if (!line) return null;
  if (direction === 1) {
    if (line.length < 2) return null;
    const word = line.pop();
    if (word == null) return null;
    const next = lines[lineIndex + 1] ?? [];
    next.unshift(word);
    lines[lineIndex + 1] = next;
  } else {
    if (lineIndex === 0) return null;
    const word = line.shift();
    if (word == null) return null;
    lines[lineIndex - 1]?.push(word);
    if (line.length === 0) lines.splice(lineIndex, 1);
  }
  return breaksFromLines(lines);
}

export function clearLines(el: HTMLElement) {
  el.querySelectorAll(`[${LINE_MARK}]`).forEach((span) => {
    const parent = span.parentNode;
    if (!parent) return;
    while (span.firstChild) parent.insertBefore(span.firstChild, span);
    parent.removeChild(span);
  });
}

export function htmlWithoutLines(el: HTMLElement) {
  const clone = el.cloneNode(true);
  if (!isHtmlElement(clone)) return el.innerHTML;
  clearLines(clone);
  return clone.innerHTML;
}

export function visualBreaks(el: HTMLElement) {
  const words = wordRanges(el);
  if (words.length < 2) return [];
  const font = parseFloat(getComputedStyle(el).fontSize) || 16;
  const gap = Math.max(2, font * 0.35);
  const breaks: number[] = [];
  let lastTop: number | null = null;
  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    if (!word) continue;
    const range = el.ownerDocument.createRange();
    range.setStart(word.node, word.start);
    range.setEnd(word.node, word.end);
    const rect = range.getBoundingClientRect();
    if (rect.height > 0 && lastTop != null && rect.top - lastTop > gap)
      breaks.push(index - 1);
    if (rect.height > 0) lastTop = rect.top;
  }
  return breaks;
}

export function applyBreaks(el: HTMLElement, breaks: number[]) {
  clearLines(el);
  const words = wordRanges(el);
  const lines = linesFromBreaks(words.length, breaks);
  if (lines.length < 2) return;
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const group = lines[index];
    if (!group || group.length === 0) continue;
    const first = words[group[0] ?? -1];
    const last = words[group[group.length - 1] ?? -1];
    if (!first || !last) continue;
    const range = el.ownerDocument.createRange();
    range.setStart(first.node, first.start);
    range.setEnd(last.node, last.end);
    const span = el.ownerDocument.createElement("span");
    span.setAttribute(LINE_MARK, "1");
    span.style.display = "block";
    span.style.whiteSpace = "nowrap";
    span.appendChild(range.extractContents());
    range.insertNode(span);
  }
}

export function isTextBlock(el: HTMLElement) {
  if (!(el.textContent ?? "").trim()) return false;
  if (el.querySelector("img, svg, video, form, ul, ol, table")) return false;
  if (el.querySelector("h1, h2, h3, h4, h5, h6, p, li, section")) return false;
  return true;
}

export function isPhotoFrame(el: HTMLElement) {
  if (el.closest("header, footer, [data-layout-editor]")) return false;
  const children = [...el.children];
  const directImg = children.find((child) => child.tagName === "IMG");
  if (!directImg) return false;
  if (children.some((child) => child.tagName !== "IMG")) return false;
  return (
    el.classList.contains("rounded-md") ||
    el.classList.contains("rounded-2xl") ||
    el.classList.contains("gallery-frame") ||
    el.tagName === "FIGURE"
  );
}

export function isStretchBlock(el: HTMLElement) {
  return isTextBlock(el) || isPhotoFrame(el);
}

function applyBox(el: HTMLElement, box: Box) {
  if (el.isContentEditable) return;
  if (box.x || box.y) ensureLayoutInlineBox(el);
  el.style.translate = box.x || box.y ? `${box.x}px ${box.y}px` : "";
  if (getComputedStyle(el).position === "static") {
    el.style.position = "relative";
    el.dataset["layoutPosition"] = "1";
  }
  el.style.zIndex = box.z > 0 ? String(box.z) : "";
  if (box.paddingTop != null) {
    el.style.setProperty("padding-top", `${box.paddingTop}px`, "important");
  }
  if (box.paddingBottom != null) {
    el.style.setProperty(
      "padding-bottom",
      `${box.paddingBottom}px`,
      "important",
    );
  }
  if (box.marginTop != null) {
    el.style.setProperty("margin-top", `${box.marginTop}px`, "important");
  }
  if (box.marginBottom != null) {
    el.style.setProperty(
      "margin-bottom",
      `${box.marginBottom}px`,
      "important",
    );
  }
  el.style.fontSize = box.fontSize != null ? `${box.fontSize}px` : "";
  el.style.width = box.width != null ? `${box.width}px` : "";
  el.style.maxWidth = box.width != null ? `${box.width}px` : "";
  if (isPhotoFrame(el) && (box.width != null || box.height != null)) {
    el.style.aspectRatio = "auto";
  }
  el.style.height = box.height != null ? `${box.height}px` : "";
  el.style.maxHeight = box.height != null ? `${box.height}px` : "";
  applyBreaks(el, box.breaks ?? []);
  for (const node of textContinuations(el)) applyContinuationStyles(node, box);
}

export function applyTheme(doc: Document, pathname: string, store: Store) {
  if (pathname !== "/") return;
  doc.documentElement.style.setProperty(
    "--home-card-fill",
    cardFillCss(cardFillFor(store, pathname)),
  );
  doc.documentElement.style.setProperty(
    "--home-discover-fill",
    cardFillCss(discoverFillFor(store, pathname)),
  );
}

export function applyLayout(
  doc: Document,
  pathname: string,
  size: SizeId,
  store: Store,
  options?: { text?: boolean; boxes?: boolean },
) {
  if (applying) return false;
  const main = doc.querySelector("main");
  if (!main) return false;
  const writeText = options?.text !== false;
  const writeBoxes = options?.boxes !== false;
  const previous = applied.get(doc) ?? new Set<string>();
  const page = store[pathname];
  const boxes = page?.[size] ?? {};
  const texts = page?.text ?? {};
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
    if (writeText) {
      for (const [selector, text] of Object.entries(texts)) {
        const el = main.querySelector(selector);
        if (!isHtmlElement(el) || el.isContentEditable) continue;
        if (el.querySelector("button, input, textarea, select")) continue;
        if (el.innerHTML !== text.html) {
          el.innerHTML = text.html;
          if (el.innerHTML !== text.html) {
            text.html = el.innerHTML;
            normalized = true;
          }
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
      if (!isHtmlElement(el)) continue;
      if (writeBoxes) applyBox(el, box);
      else if ((box.breaks?.length ?? 0) > 0) applyBreaks(el, box.breaks ?? []);
    }
    applied.set(doc, next);
    return normalized;
  } finally {
    applying = false;
  }
}
