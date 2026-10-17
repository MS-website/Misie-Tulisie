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

export type PageTheme = {
  berryOpacity?: number;
  cardL?: number;
  cardC?: number;
  cardH?: number;
  cardAlpha?: number;
  spaceL?: number;
  spaceC?: number;
  spaceH?: number;
  spaceAlpha?: number;
  discoverL?: number;
  discoverC?: number;
  discoverH?: number;
  discoverAlpha?: number;
};

export type CardFill = {
  l: number;
  c: number;
  h: number;
  alpha: number;
};

export type PageLayout = {
  text?: Record<string, TextChange>;
  theme?: PageTheme;
  sm?: Record<string, Box>;
  md?: Record<string, Box>;
  lg?: Record<string, Box>;
};

export const DEFAULT_CARD_FILL: CardFill = {
  l: 0.94,
  c: 0.022,
  h: 110,
  alpha: 90,
};

export const DEFAULT_SPACE_FILL: CardFill = {
  l: 0.795,
  c: 0.074,
  h: 234,
  alpha: 20,
};

export const DEFAULT_DISCOVER_FILL: CardFill = {
  l: 0.955,
  c: 0.011,
  h: 80,
  alpha: 40,
};

type ThemeFillKeys = {
  l: keyof PageTheme;
  c: keyof PageTheme;
  h: keyof PageTheme;
  a: keyof PageTheme;
};

function clampAlpha(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function clampCardL(value: number) {
  return Math.min(0.98, Math.max(0.58, Math.round(value * 1000) / 1000));
}

function clampCardC(value: number) {
  return Math.min(0.16, Math.max(0, Math.round(value * 1000) / 1000));
}

function normHue(value: number) {
  const h = value % 360;
  return h < 0 ? h + 360 : h;
}

function fillForTheme(
  theme: PageTheme | undefined,
  keys: ThemeFillKeys,
  defaults: CardFill,
  legacyAlpha?: number,
): CardFill {
  if (!theme) return defaults;
  const alphaRaw = theme[keys.a];
  const alpha =
    typeof alphaRaw === "number"
      ? clampAlpha(alphaRaw)
      : legacyAlpha != null
        ? clampAlpha(legacyAlpha)
        : defaults.alpha;
  const l = theme[keys.l];
  const c = theme[keys.c];
  const h = theme[keys.h];
  if (
    typeof l === "number" &&
    typeof c === "number" &&
    typeof h === "number"
  ) {
    return {
      l: clampCardL(l),
      c: clampCardC(c),
      h: normHue(h),
      alpha,
    };
  }
  return { ...defaults, alpha };
}

export function cardFillFor(store: Store, pathname: string): CardFill {
  const theme = store[pathname]?.theme;
  return fillForTheme(
    theme,
    { l: "cardL", c: "cardC", h: "cardH", a: "cardAlpha" },
    DEFAULT_CARD_FILL,
    theme?.berryOpacity,
  );
}

export function spaceFillFor(store: Store, pathname: string): CardFill {
  const theme = store[pathname]?.theme;
  return fillForTheme(
    theme,
    { l: "spaceL", c: "spaceC", h: "spaceH", a: "spaceAlpha" },
    DEFAULT_SPACE_FILL,
  );
}

export function discoverFillFor(store: Store, pathname: string): CardFill {
  const theme = store[pathname]?.theme;
  return fillForTheme(
    theme,
    {
      l: "discoverL",
      c: "discoverC",
      h: "discoverH",
      a: "discoverAlpha",
    },
    DEFAULT_DISCOVER_FILL,
  );
}

export function cardFillCss(fill: CardFill): string {
  const l = Math.round(fill.l * 1000) / 1000;
  const c = Math.round(fill.c * 1000) / 1000;
  const h = Math.round(fill.h * 10) / 10;
  return `oklch(${l} ${c} ${h} / ${fill.alpha}%)`;
}

export type Store = Record<string, PageLayout>;

const PATH_OK = /^\/[a-z0-9\-/]*$/;
const SELECTOR_OK = /^[a-z0-9:()\->. ]+$/i;
const UKLAD_TEXT_SELECTOR = /^[data-uklad-text="[a-z0-9-]+"\]$/;
const UKLAD_SECTION_SELECTOR = /^[data-uklad-section="[a-z0-9-]+"\]$/;

function layoutSelectorOk(selector: string) {
  return (
    SELECTOR_OK.test(selector) ||
    UKLAD_TEXT_SELECTOR.test(selector) ||
    UKLAD_SECTION_SELECTOR.test(selector)
  );
}
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
  if (/<\s*button\b/i.test(html) || /<\s*button\b/i.test(originalHtml))
    return null;
  return { html, originalHtml };
}

function readTheme(value: Record<string, unknown>): PageTheme | undefined {
  const raw = value["theme"];
  if (!isRecord(raw)) return undefined;
  const theme: PageTheme = {};
  const berryOpacity = numberOrNull(raw["berryOpacity"]);
  if (berryOpacity != null && berryOpacity >= 0 && berryOpacity <= 100) {
    theme.berryOpacity = berryOpacity;
  }
  const cardL = typeof raw["cardL"] === "number" ? raw["cardL"] : null;
  if (cardL != null && Number.isFinite(cardL) && cardL >= 0.5 && cardL <= 1) {
    theme.cardL = cardL;
  }
  const cardC = typeof raw["cardC"] === "number" ? raw["cardC"] : null;
  if (cardC != null && Number.isFinite(cardC) && cardC >= 0 && cardC <= 0.2) {
    theme.cardC = cardC;
  }
  const cardH = typeof raw["cardH"] === "number" ? raw["cardH"] : null;
  if (cardH != null && Number.isFinite(cardH)) theme.cardH = cardH;
  const cardAlpha = numberOrNull(raw["cardAlpha"]);
  if (cardAlpha != null && cardAlpha >= 0 && cardAlpha <= 100) {
    theme.cardAlpha = cardAlpha;
  }
  const spaceL = typeof raw["spaceL"] === "number" ? raw["spaceL"] : null;
  if (spaceL != null && Number.isFinite(spaceL) && spaceL >= 0.5 && spaceL <= 1) {
    theme.spaceL = spaceL;
  }
  const spaceC = typeof raw["spaceC"] === "number" ? raw["spaceC"] : null;
  if (spaceC != null && Number.isFinite(spaceC) && spaceC >= 0 && spaceC <= 0.2) {
    theme.spaceC = spaceC;
  }
  const spaceH = typeof raw["spaceH"] === "number" ? raw["spaceH"] : null;
  if (spaceH != null && Number.isFinite(spaceH)) theme.spaceH = spaceH;
  const spaceAlpha = numberOrNull(raw["spaceAlpha"]);
  if (spaceAlpha != null && spaceAlpha >= 0 && spaceAlpha <= 100) {
    theme.spaceAlpha = spaceAlpha;
  }
  const discoverL = typeof raw["discoverL"] === "number" ? raw["discoverL"] : null;
  if (
    discoverL != null &&
    Number.isFinite(discoverL) &&
    discoverL >= 0.5 &&
    discoverL <= 1
  ) {
    theme.discoverL = discoverL;
  }
  const discoverC = typeof raw["discoverC"] === "number" ? raw["discoverC"] : null;
  if (
    discoverC != null &&
    Number.isFinite(discoverC) &&
    discoverC >= 0 &&
    discoverC <= 0.2
  ) {
    theme.discoverC = discoverC;
  }
  const discoverH = typeof raw["discoverH"] === "number" ? raw["discoverH"] : null;
  if (discoverH != null && Number.isFinite(discoverH)) theme.discoverH = discoverH;
  const discoverAlpha = numberOrNull(raw["discoverAlpha"]);
  if (discoverAlpha != null && discoverAlpha >= 0 && discoverAlpha <= 100) {
    theme.discoverAlpha = discoverAlpha;
  }
  return Object.keys(theme).length > 0 ? theme : undefined;
}

function isOldPage(value: Record<string, unknown>) {
  return Object.entries(value).some(([key, entry]) => {
    if (
      key === "sm" ||
      key === "md" ||
      key === "lg" ||
      key === "text" ||
      key === "theme"
    )
      return false;
    return isRecord(entry) && "x" in entry;
  });
}

function convertOld(value: Record<string, unknown>): PageLayout | null {
  const lg: Record<string, Box> = {};
  const text: Record<string, TextChange> = {};
  for (const [selector, entry] of Object.entries(value)) {
    if (!layoutSelectorOk(selector)) continue;
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
    if (!layoutSelectorOk(selector)) continue;
    const box = readBox(entry);
    if (box) map[selector] = box;
  }
  return Object.keys(map).length > 0 ? map : null;
}

function readTextMap(value: unknown) {
  if (!isRecord(value)) return null;
  const map: Record<string, TextChange> = {};
  for (const [selector, entry] of Object.entries(value)) {
    if (!layoutSelectorOk(selector)) continue;
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
  const theme = readTheme(value);
  if (theme) page.theme = theme;
  if (!page.sm && !page.md && !page.lg && !page.text && !page.theme) return null;
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
  if (typeof patch.height === "number") next.height = patch.height;
  else if (!("height" in patch) && typeof current.height === "number")
    next.height = current.height;
  if (patch.breaks && patch.breaks.length > 0) next.breaks = patch.breaks;
  else if (!("breaks" in patch) && current.breaks && current.breaks.length > 0)
    next.breaks = current.breaks;
  return next;
}

export function mergeStores(base: Store, override: Store): Store {
  const out: Store = structuredClone(base);
  for (const [path, pageOver] of Object.entries(override)) {
    const page: PageLayout = out[path] ?? {};
    for (const size of SIZE_ORDER) {
      const patchMap = pageOver[size];
      if (!patchMap) continue;
      const sizeMap = page[size] ?? {};
      for (const [selector, patch] of Object.entries(patchMap)) {
        sizeMap[selector] = mergeBox(
          sizeMap[selector] ?? { x: 0, y: 0, z: 0 },
          patch,
        );
      }
      page[size] = sizeMap;
    }
    if (pageOver.text) {
      page.text = { ...(page.text ?? {}), ...pageOver.text };
    }
    if (pageOver.theme) {
      page.theme = { ...(page.theme ?? {}), ...pageOver.theme };
    }
    out[path] = page;
  }
  return out;
}
