export const SIZE_ORDER = ["sm", "md", "lg"] as const;

export type SizeId = (typeof SIZE_ORDER)[number];

export const SIZE_META: Record<
  SizeId,
  { label: string; width: number; height: number }
> = {
  sm: { label: "Telefon", width: 390, height: 844 },
  md: { label: "Tablet", width: 820, height: 900 },
  lg: { label: "Komputer", width: 1280, height: 900 },
};

export type Box = {
  x: number;
  y: number;
  z: number;
  paddingTop?: number;
  paddingBottom?: number;
  marginTop?: number;
  marginBottom?: number;
  fontSize?: number;
  width?: number;
  height?: number;
  breaks?: number[];
};

export type TextChange = {
  html: string;
  originalHtml: string;
};

export type PageLayout = {
  text?: Record<string, TextChange>;
  sm?: Record<string, Box>;
  md?: Record<string, Box>;
  lg?: Record<string, Box>;
};

export type Store = Record<string, PageLayout>;

const PATH_OK = /^\/[a-z0-9\-/]*$/;
const SELECTOR_OK = /^[a-z0-9:()\->. ]+$/i;
const MAX_HTML = 20_000;

export function sizeForWidth(width: number): SizeId {
  if (width < 768) return "sm";
  if (width < 1024) return "md";
  return "lg";
}

export function stableLayout(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== "object") return value;
  const entries = Object.entries(value as Record<string, unknown>).sort(
    ([a], [b]) => a.localeCompare(b),
  );
  return Object.fromEntries(
    entries.map(([key, item]) => [key, sortValue(item)]),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.round(value)
    : null;
}

function readBox(value: unknown): Box | null {
  if (!isRecord(value)) return null;
  const x = numberOrNull(value["x"]);
  const y = numberOrNull(value["y"]);
  const z = numberOrNull(value["z"]);
  if (x == null || y == null || z == null) return null;
  const box: Box = { x, y, z: Math.min(30, Math.max(0, z)) };
  for (const key of [
    "paddingTop",
    "paddingBottom",
    "marginTop",
    "marginBottom",
  ] as const) {
    const next = numberOrNull(value[key]);
    if (next != null) box[key] = next;
  }
  const fontSize = numberOrNull(value["fontSize"]);
  if (fontSize != null && fontSize >= 8 && fontSize <= 240)
    box.fontSize = fontSize;
  const width = numberOrNull(value["width"]);
  if (width != null && width >= 40 && width <= 2000) box.width = width;
  const height = numberOrNull(value["height"]);
  if (height != null && height >= 40 && height <= 2000) box.height = height;
  const breaks = readBreaks(value["breaks"]);
  if (breaks) box.breaks = breaks;
  return box;
}

function readBreaks(value: unknown) {
  if (!Array.isArray(value)) return null;
  const breaks = [
    ...new Set(
      value.filter(
        (item): item is number =>
          typeof item === "number" &&
          Number.isInteger(item) &&
          item >= 0 &&
          item < 500,
      ),
    ),
  ]
    .sort((a, b) => a - b)
    .slice(0, 80);
  return breaks.length > 0 ? breaks : null;
}

function readText(value: unknown): TextChange | null {
  if (!isRecord(value)) return null;
  const html = value["html"];
  const originalHtml = value["originalHtml"];
  if (typeof html !== "string" || typeof originalHtml !== "string") return null;
  if (html.length > MAX_HTML || originalHtml.length > MAX_HTML) return null;
  return { html, originalHtml };
}

function isOldPage(value: Record<string, unknown>) {
  return Object.entries(value).some(([key, entry]) => {
    if (key === "sm" || key === "md" || key === "lg" || key === "text")
      return false;
    return isRecord(entry) && "x" in entry;
  });
}

function convertOld(value: Record<string, unknown>): PageLayout | null {
  const lg: Record<string, Box> = {};
  const text: Record<string, TextChange> = {};
  for (const [selector, entry] of Object.entries(value)) {
    if (!SELECTOR_OK.test(selector)) continue;
    const box = readBox(entry);
    if (!box) continue;
    lg[selector] = box;
    if (!isRecord(entry)) continue;
    const html = typeof entry["html"] === "string" ? entry["html"] : null;
    const originalHtml =
      typeof entry["originalHtml"] === "string" ? entry["originalHtml"] : null;
    if (
      html != null &&
      originalHtml != null &&
      html.length <= MAX_HTML &&
      originalHtml.length <= MAX_HTML
    ) {
      text[selector] = { html, originalHtml };
    }
  }
  if (Object.keys(lg).length === 0 && Object.keys(text).length === 0)
    return null;
  const page: PageLayout = {};
  if (Object.keys(lg).length > 0) page.lg = lg;
  if (Object.keys(text).length > 0) page.text = text;
  return page;
}

function readSizeMap(value: unknown) {
  if (!isRecord(value)) return null;
  const map: Record<string, Box> = {};
  for (const [selector, entry] of Object.entries(value)) {
    if (!SELECTOR_OK.test(selector)) continue;
    const box = readBox(entry);
    if (box) map[selector] = box;
  }
  return Object.keys(map).length > 0 ? map : null;
}

function readTextMap(value: unknown) {
  if (!isRecord(value)) return null;
  const map: Record<string, TextChange> = {};
  for (const [selector, entry] of Object.entries(value)) {
    if (!SELECTOR_OK.test(selector)) continue;
    const text = readText(entry);
    if (text) map[selector] = text;
  }
  return Object.keys(map).length > 0 ? map : null;
}

function convertNew(value: Record<string, unknown>): PageLayout | null {
  const page: PageLayout = {};
  for (const size of SIZE_ORDER) {
    const map = readSizeMap(value[size]);
    if (map) page[size] = map;
  }
  const text = readTextMap(value["text"]);
  if (text) page.text = text;
  if (!page.sm && !page.md && !page.lg && !page.text) return null;
  return page;
}

export function normalizeLayout(input: unknown): Store {
  if (!isRecord(input)) return {};
  const store: Store = {};
  for (const [path, page] of Object.entries(input)) {
    if (!PATH_OK.test(path) || !isRecord(page)) continue;
    const next = isOldPage(page) ? convertOld(page) : convertNew(page);
    if (next) store[path] = next;
  }
  return store;
}

export function mergeBox(current: Box, patch: Partial<Box>): Box {
  const next: Box = {
    x: patch.x ?? current.x,
    y: patch.y ?? current.y,
    z: patch.z ?? current.z,
  };
  for (const key of [
    "paddingTop",
    "paddingBottom",
    "marginTop",
    "marginBottom",
  ] as const) {
    const value = key in patch ? patch[key] : current[key];
    if (value != null) next[key] = value;
  }
  if (typeof patch.fontSize === "number") next.fontSize = patch.fontSize;
  else if (!("fontSize" in patch) && typeof current.fontSize === "number")
    next.fontSize = current.fontSize;
  if (typeof patch.width === "number") next.width = patch.width;
  else if (!("width" in patch) && typeof current.width === "number")
    next.width = current.width;
  if (patch.breaks && patch.breaks.length > 0) next.breaks = patch.breaks;
  else if (!("breaks" in patch) && current.breaks && current.breaks.length > 0)
    next.breaks = current.breaks;
  return next;
}
