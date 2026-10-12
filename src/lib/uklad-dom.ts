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

const LINE_MARK = "data-uklad-line";

export type WordRange = { node: Text; start: number; end: number };

export function clearBox(el: HTMLElement) {
  el.style.translate = "";
  el.style.zIndex = "";
  el.style.paddingTop = "";
  el.style.paddingBottom = "";
  el.style.marginTop = "";
  el.style.marginBottom = "";
  el.style.fontSize = "";
  el.style.width = "";
  el.style.maxWidth = "";
  clearLines(el);
  if (el.dataset["layoutPosition"] === "1") {
    el.style.position = "";
    delete el.dataset["layoutPosition"];
  }
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
  el.style.fontSize = box.fontSize != null ? `${box.fontSize}px` : "";
  el.style.width = box.width != null ? `${box.width}px` : "";
  el.style.maxWidth = box.width != null ? `${box.width}px` : "";
  applyBreaks(el, box.breaks ?? []);
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
