import type { Store } from "./uklad-data";

const SELECTOR_OK = /^[a-z0-9:()\->. ]+$/i;
const UKLAD_TEXT_SELECTOR = /^[data-uklad-text="[a-z0-9-]+"\]$/;

export function isUkladTextSelector(selector: string) {
  if (selector.length > 500) return false;
  return SELECTOR_OK.test(selector) || UKLAD_TEXT_SELECTOR.test(selector);
}
const MAX_HTML = 20_000;

const ALLOWED_ATTRS: Record<string, ReadonlySet<string>> = {
  a: new Set(["href", "class"]),
  span: new Set(["class", "style", "aria-hidden", "title", "data-plan-day-icon"]),
  div: new Set(["class", "style"]),
  br: new Set(),
  em: new Set(["class", "style"]),
  strong: new Set(["class"]),
  svg: new Set(["viewBox", "class", "fill", "aria-hidden"]),
  path: new Set([
    "d",
    "class",
    "stroke-width",
    "stroke-linecap",
    "stroke-linejoin",
  ]),
  circle: new Set(["cx", "cy", "r", "class", "stroke-width"]),
};

const VOID_TAGS = new Set(["br"]);
const STYLE_PROPS = new Set([
  "caret-color",
  "color",
  "font-family",
  "font-size",
  "letter-spacing",
]);
const STYLE_VALUE =
  /^(?:rgb\(\s*(?:[0-9]{1,3}\s*,\s*){2}[0-9]{1,3}\s*\)|var\(--[a-z0-9-]+\)|-?(?:[0-9]+(?:\.[0-9]+)?)(?:rem|em|px|%)?)$/i;
const CLASS_TOKEN = /^[a-zA-Z0-9_:/.[\]%+-]+$/;
const MAILTO = /^mailto:[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
const PATH_D = /^[MmLlHhVvCcSsQqTtAaZz0-9\s,.-]+$/;
const DECIMAL = /^(?:0|[1-9][0-9]{0,3})(?:\.[0-9]{1,3})?$/;
const VIEW_BOX = /^(?:0|[1-9][0-9]{0,3})(?:\s+(?:0|[1-9][0-9]{0,3})){3}$/;
const ENTITY = /^&(?:nbsp|amp|quot|lt|gt|#\d{1,7}|#x[0-9a-fA-F]{1,6});/;

function styleAllowed(value: string) {
  if (value.length > 300 || /url\s*\(|expression\s*\(|\/\*|\*\//i.test(value))
    return false;
  const parts = value.split(";");
  let seen = 0;
  for (const part of parts) {
    const item = part.trim();
    if (!item) continue;
    const split = item.indexOf(":");
    if (split <= 0) return false;
    const prop = item.slice(0, split).trim().toLowerCase();
    const raw = item.slice(split + 1).trim();
    if (!STYLE_PROPS.has(prop) || !STYLE_VALUE.test(raw)) return false;
    seen += 1;
  }
  return seen > 0;
}

function classAllowed(value: string) {
  if (!value || value.length > 500) return false;
  const tokens = value.split(/\s+/);
  return tokens.every((token) => CLASS_TOKEN.test(token));
}

function attrAllowed(tag: string, name: string, value: string) {
  if (value.includes("<") || value.includes(">") || value.includes("`"))
    return false;
  if (/javascript\s*:/i.test(value)) return false;
  if (name === "class") return classAllowed(value);
  if (name === "style") return styleAllowed(value);
  if (name === "href") return MAILTO.test(value);
  if (name === "aria-hidden") return value === "true" || value === "false";
  if (name === "title") return value.length > 0 && value.length <= 200;
  if (name === "data-plan-day-icon") return /^[a-z][a-z0-9-]{0,32}$/.test(value);
  if (name === "viewBox") return VIEW_BOX.test(value);
  if (name === "fill") return value === "none";
  if (name === "d") return value.length <= 400 && PATH_D.test(value);
  if (name === "stroke-linecap" || name === "stroke-linejoin") {
    return value === "round" || value === "butt" || value === "square";
  }
  if (
    name === "cx" ||
    name === "cy" ||
    name === "r" ||
    name === "stroke-width"
  ) {
    return DECIMAL.test(value);
  }
  return false;
}

function attrsAllowed(tag: string, source: string) {
  const allowed = ALLOWED_ATTRS[tag];
  if (!allowed) return false;
  let rest = source.trim();
  const seen = new Set<string>();
  while (rest) {
    const match = /^([a-zA-Z_:][-a-zA-Z0-9_:.]*)="([^"]*)"/.exec(rest);
    if (!match) return false;
    const name = match[1] ?? "";
    const value = match[2] ?? "";
    if (!allowed.has(name) || seen.has(name) || !attrAllowed(tag, name, value))
      return false;
    seen.add(name);
    rest = rest.slice(match[0].length).trim();
  }
  return true;
}

export function sanitizeUkladHtml(html: string): string | null {
  if (typeof html !== "string" || html.length > MAX_HTML) return null;
  if (html === "") return "";
  const stack: string[] = [];
  let index = 0;
  while (index < html.length) {
    const char = html[index];
    if (char === "<") {
      if (html.startsWith("<!--", index)) {
        const end = html.indexOf("-->", index + 4);
        if (end < 0) return null;
        const body = html.slice(index + 4, end);
        if (body.includes("--") || body.includes("<")) return null;
        index = end + 3;
        continue;
      }
      const close = /^<\/([a-z][a-z0-9]*)\s*>/.exec(html.slice(index));
      if (close) {
        const name = close[1] ?? "";
        if (stack.pop() !== name) return null;
        index += close[0].length;
        continue;
      }
      const open = /^<([a-z][a-z0-9]*)((?:\s[^<>]*?)?)\s*(\/?)>/.exec(
        html.slice(index),
      );
      if (!open) return null;
      const name = open[1] ?? "";
      if (!ALLOWED_ATTRS[name]) return null;
      if (!attrsAllowed(name, open[2] ?? "")) return null;
      const selfClosing = open[3] === "/";
      if (VOID_TAGS.has(name)) {
        if (selfClosing && open[0] !== `<${name}/>` && open[0] !== `<${name} />`)
          return null;
      } else if (selfClosing) {
        return null;
      } else {
        stack.push(name);
      }
      index += open[0].length;
      continue;
    }
    if (char === "&") {
      const entity = ENTITY.exec(html.slice(index));
      if (!entity) return null;
      index += entity[0].length;
      continue;
    }
    index += 1;
  }
  if (stack.length > 0) return null;
  return html;
}

// Parser HTML zamyka akapit przed blokowym divem. Zwraca ten podział albo null,
// gdy w treści nie ma diva na najwyższym poziomie.
export function splitParagraphHtml(
  html: string,
): { phrasing: string; blocks: string[] } | null {
  const start = indexOfTopLevel(html, "div");
  if (start < 0) return null;
  const blocks: string[] = [];
  let index = start;
  while (index < html.length) {
    if (!html.startsWith("<div>", index)) return null;
    const innerStart = index + "<div>".length;
    let depth = 1;
    let cursor = innerStart;
    while (cursor < html.length && depth > 0) {
      if (html.startsWith("</div>", cursor)) {
        depth -= 1;
        if (depth === 0) break;
        cursor += "</div>".length;
        continue;
      }
      if (html.startsWith("<div>", cursor)) {
        depth += 1;
        cursor += "<div>".length;
        continue;
      }
      cursor += 1;
    }
    if (depth !== 0) return null;
    blocks.push(html.slice(innerStart, cursor));
    index = cursor + "</div>".length;
  }
  return { phrasing: html.slice(0, start), blocks };
}

export function continuationBlocksArePhrasingOnly(blocks: string[]) {
  return blocks.every((block) => !/<div\b/i.test(block));
}

/** Krótkie spójniki na początku kontynuacji — bez sierotek na końcu linii. */
export function inlineContinuationHtml(block: string) {
  return block.replace(
    /^([a-ząćęłńóśźż])\s+/i,
    (_, letter: string) => `${letter}\u00A0`,
  );
}

function indexOfTopLevel(html: string, tag: string) {
  let depth = 0;
  let index = 0;
  while (index < html.length) {
    if (html[index] !== "<") {
      index += 1;
      continue;
    }
    if (html.startsWith("<!--", index)) {
      const end = html.indexOf("-->", index + 4);
      if (end < 0) return -1;
      index = end + 3;
      continue;
    }
    const close = /^<\/([a-z][a-z0-9]*)\s*>/.exec(html.slice(index));
    if (close) {
      depth -= 1;
      index += close[0].length;
      continue;
    }
    const open = /^<([a-z][a-z0-9]*)(?:\s[^<>]*?)?\s*(\/?)>/.exec(
      html.slice(index),
    );
    if (!open) return -1;
    const name = open[1] ?? "";
    if (depth === 0 && name === tag) return index;
    if (!VOID_TAGS.has(name) && open[2] !== "/") depth += 1;
    index += open[0].length;
  }
  return -1;
}

export function savedFragment(
  store: Store,
  pathname: string,
  selector: string,
): string | null {
  if (!isUkladTextSelector(selector)) return null;
  const text = store[pathname]?.text?.[selector];
  if (!text || text.html === text.originalHtml) return null;
  return sanitizeUkladHtml(text.html);
}
