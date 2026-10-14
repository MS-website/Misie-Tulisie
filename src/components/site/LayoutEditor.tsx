import { useRouterState } from "@tanstack/react-router";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  applyLayout,
  applyTheme,
  clearBox,
  htmlWithoutLines,
  isApplying,
  isHtmlElement,
  isPhotoFrame,
  isStretchBlock,
  isTextBlock,
  linesFromBreaks,
  moveLineWord,
  visualBreaks,
  wordRanges,
} from "@/lib/uklad-dom";
import savedFile from "@/uklad.json";
import {
  mergeBox,
  mergeStores,
  normalizeLayout,
  sizeForWidth,
  stableLayout,
  SIZE_META,
  SIZE_ORDER,
  type Box,
  type PageLayout,
  type SizeId,
  type Store,
} from "@/lib/uklad-data";

const STORAGE_KEY = "misie-uklad-v1";
const COLLAPSE_KEY = "misie-uklad-collapsed";
const PANEL_KEY = "misie-uklad-panel";
const HISTORY_KEY = "misie-uklad-historia";
const HISTORY_EVENT = "misie-uklad-history";
const CHANGE_EVENT = "misie-uklad-changed";
const PARENTS_LAYOUT_RESET_KEY = "misie-uklad-reset-dla-rodzicow-v6";
const HOME_CARD_FILL_RESET_KEY = "misie-uklad-reset-home-card-sage-v1";
const HOME_LAYOUT_ZERO_KEY = "misie-uklad-zero-home-v1";
const HOME_KROKI_LINES_KEY = "misie-uklad-home-kroki-lines-v2";
const HERO_HONEY_UNDO_KEY = "misie-uklad-hero-honey-undo-v1";
const HERO_H1 =
  "section:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > h1:nth-of-type(1)";
const HERO_HTML =
  'Miejsce,<br>w którym małe<br>kroki mają<br><em class="text-honey">wielkie znaczenie</em>';
const KROKI_PARAGRAPH =
  "section:nth-of-type(5) > div:nth-of-type(1) > article:nth-of-type(2) > div:nth-of-type(1) > p:nth-of-type(1)";
const BLOCK =
  "section, h1, h2, h3, h4, p, li, figure, a, button, img, div.rounded-2xl, div.rounded-md";
const OUTLINE_STYLE = `
  [data-layout-hover="1"] { outline: 1px dashed #b08954; outline-offset: 4px; }
  [data-layout-selected="1"] { outline: 2px solid #b08954; outline-offset: 4px; position: relative; z-index: 40 !important; }
  [contenteditable="true"] { outline: 2px solid #8c6a3d; outline-offset: 4px; cursor: text; }
  body[data-layout-editing="1"] main a,
  body[data-layout-editing="1"] main button {
    user-select: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
  }
`;

let stepRecorded = false;

let publishedLayout = normalizeLayout(savedFile);

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw == null ? {} : normalizeLayout(JSON.parse(raw));
  } catch {
    return {};
  }
}

function layoutStore(): Store {
  return mergeStores(publishedLayout, loadStore());
}

function saveStore(store: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function remapSection57<T>(record: Record<string, T> | undefined) {
  if (!record) return;
  const next: Record<string, T> = {};
  for (const [key, value] of Object.entries(record)) {
    let mapped = key;
    if (mapped.includes("section:nth-of-type(5)")) {
      mapped = mapped.replace(
        "section:nth-of-type(5)",
        "section:nth-of-type(§)",
      );
    }
    if (mapped.includes("section:nth-of-type(7)")) {
      mapped = mapped.replace(
        "section:nth-of-type(7)",
        "section:nth-of-type(5)",
      );
    }
    mapped = mapped.replace("section:nth-of-type(§)", "section:nth-of-type(7)");
    next[mapped] = value;
  }
  for (const key of Object.keys(record)) delete record[key];
  Object.assign(record, next);
}

const KONTAKT_EMAIL_LINK =
  "section:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > a:nth-of-type(1)";

function stripKontaktEmailLinkWidth(store: Store) {
  const page = store["/kontakt"];
  if (!page) return;
  for (const size of SIZE_ORDER) {
    const box = page[size]?.[KONTAKT_EMAIL_LINK];
    if (box && box.width != null) delete box.width;
  }
}

function moveAboutSections(store: Store) {
  const page = store["/o-nas"];
  const text = page?.text;
  if (
    !page ||
    !text ||
    !Object.keys(text).some((key) =>
      key.startsWith("section:nth-of-type(7) > ul"),
    )
  ) {
    return;
  }
  remapSection57(page.sm);
  remapSection57(page.md);
  remapSection57(page.lg);
  remapSection57(page.text);
}

function stripLegacyHidden(store: Store) {
  for (const page of Object.values(store)) {
    delete (page as PageLayout & { hidden?: unknown }).hidden;
  }
}

function resetParentsPageLayoutOnce() {
  if (localStorage.getItem(PARENTS_LAYOUT_RESET_KEY)) return false;
  localStorage.setItem(PARENTS_LAYOUT_RESET_KEY, "1");
  const store = loadStore();
  delete store["/dla-rodzicow"];
  saveStore(store);
  if (window.location.pathname === "/dla-rodzicow") {
    window.location.reload();
    return true;
  }
  return false;
}

function resetHomeCardFillOnce() {
  if (localStorage.getItem(HOME_CARD_FILL_RESET_KEY)) return;
  localStorage.setItem(HOME_CARD_FILL_RESET_KEY, "1");
  const store = loadStore();
  const page = store["/"] ?? {};
  page.theme = {
    ...(page.theme ?? {}),
    cardL: 0.94,
    cardC: 0.022,
    cardH: 110,
    cardAlpha: 90,
  };
  store["/"] = page;
  saveStore(store);
}

function stripHomeOffsets(page: PageLayout | undefined) {
  if (!page) return;
  delete page.sm;
  delete page.md;
  delete page.lg;
  delete page.text;
}

function resetHomeLayoutOnce() {
  if (localStorage.getItem(HOME_LAYOUT_ZERO_KEY)) return false;
  const store = loadStore();
  const page = store["/"];
  const hadOffsets = Boolean(page?.sm || page?.md || page?.lg || page?.text);
  localStorage.setItem(HOME_LAYOUT_ZERO_KEY, "1");
  stripHomeOffsets(page);
  saveStore(store);
  const history = loadHistory();
  for (const entry of history) stripHomeOffsets(entry["/"]);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  if (hadOffsets && window.location.pathname === "/") {
    window.location.reload();
    return true;
  }
  return false;
}

function stripKrokiOverride(page: PageLayout | undefined) {
  if (!page) return false;
  let changed = false;
  if (page.text?.[KROKI_PARAGRAPH]) {
    delete page.text[KROKI_PARAGRAPH];
    if (Object.keys(page.text).length === 0) delete page.text;
    changed = true;
  }
  for (const size of SIZE_ORDER) {
    const boxes = page[size];
    if (!boxes?.[KROKI_PARAGRAPH]) continue;
    delete boxes[KROKI_PARAGRAPH];
    if (Object.keys(boxes).length === 0) delete page[size];
    changed = true;
  }
  return changed;
}

function resetKrokiLinesOnce() {
  if (localStorage.getItem(HOME_KROKI_LINES_KEY)) return false;
  localStorage.setItem(HOME_KROKI_LINES_KEY, "1");
  const store = loadStore();
  const changed = stripKrokiOverride(store["/"]);
  if (changed) saveStore(store);
  const history = loadHistory();
  let historyChanged = false;
  for (const entry of history) {
    if (stripKrokiOverride(entry["/"])) historyChanged = true;
  }
  if (historyChanged)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  if (changed && window.location.pathname === "/") {
    window.location.reload();
    return true;
  }
  return false;
}

function undoHeroHoney(page: PageLayout | undefined) {
  const text = page?.text?.[HERO_H1];
  if (!text?.html.includes(">wielkie</em> znaczenie")) return false;
  text.html = HERO_HTML;
  text.originalHtml = HERO_HTML;
  return true;
}

function undoHeroHoneyOnce() {
  if (localStorage.getItem(HERO_HONEY_UNDO_KEY)) return false;
  localStorage.setItem(HERO_HONEY_UNDO_KEY, "1");
  const store = loadStore();
  const changed = undoHeroHoney(store["/"]);
  if (changed) saveStore(store);
  const history = loadHistory();
  let historyChanged = false;
  for (const entry of history) {
    if (undoHeroHoney(entry["/"])) historyChanged = true;
  }
  if (historyChanged)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  if (changed && window.location.pathname === "/") {
    window.location.reload();
    return true;
  }
  return false;
}

if (typeof window !== "undefined") {
  resetHomeLayoutOnce();
  resetKrokiLinesOnce();
  undoHeroHoneyOnce();
}

function migrateAboutSections() {
  if (resetParentsPageLayoutOnce()) return;
  if (resetHomeLayoutOnce()) return;
  if (resetKrokiLinesOnce()) return;
  if (undoHeroHoneyOnce()) return;
  resetHomeCardFillOnce();
  const store = loadStore();
  const before = stableLayout(store);
  moveAboutSections(store);
  stripKontaktEmailLinkWidth(store);
  stripLegacyHidden(store);
  if (stableLayout(store) !== before) saveStore(store);
  const history = loadHistory();
  let historyChanged = false;
  for (const entry of history) {
    const snap = stableLayout(entry);
    moveAboutSections(entry);
    stripKontaktEmailLinkWidth(entry);
    stripLegacyHidden(entry);
    if (stableLayout(entry) !== snap) historyChanged = true;
  }
  if (historyChanged) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
}

function loadHistory(): Store[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.map((entry) => normalizeLayout(entry))
      : [];
  } catch {
    return [];
  }
}

function rememberHistory() {
  if (stepRecorded) return;
  stepRecorded = true;
  const history = loadHistory();
  history.push(loadStore());
  while (history.length > 60) history.shift();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  window.dispatchEvent(new Event(HISTORY_EVENT));
}

function finishStep() {
  stepRecorded = false;
}

function sectionForSpacing(el: HTMLElement, main: Element) {
  if (el.tagName === "SECTION") return el;
  const section = el.closest("section");
  if (section && main.contains(section) && isHtmlElement(section)) return section;
  return el;
}

function readVerticalSpacing(el: HTMLElement, edge: "top" | "bottom") {
  const paddingProp = edge === "bottom" ? "paddingBottom" : "paddingTop";
  const marginProp = edge === "bottom" ? "marginBottom" : "marginTop";
  const style = getComputedStyle(el);
  return {
    paddingProp,
    marginProp,
    padding:
      parseFloat(edge === "bottom" ? style.paddingBottom : style.paddingTop) ||
      0,
    margin:
      parseFloat(edge === "bottom" ? style.marginBottom : style.marginTop) || 0,
  };
}

function selectorFor(el: Element, root: Element) {
  if (!root.contains(el) || el === root) return null;
  const parts: string[] = [];
  let node: Element | null = el;
  while (node && node !== root) {
    const parent: HTMLElement | null = node.parentElement;
    if (!parent) return null;
    const tag = node.tagName;
    const index =
      [...parent.children]
        .filter((child) => child.tagName === tag)
        .indexOf(node) + 1;
    parts.unshift(`${tag.toLowerCase()}:nth-of-type(${index})`);
    node = parent;
  }
  return parts.join(" > ");
}

function eventTargetElement(target: EventTarget | null) {
  if (!target || (target as Node).nodeType == null) return null;
  if ((target as Node).nodeType === 1) return target as Element;
  if ((target as Node).nodeType === 3) return (target as Node).parentElement;
  return null;
}

function blocksUnderPoint(doc: Document, main: Element, x: number, y: number) {
  const blocks: HTMLElement[] = [];
  const seen = new Set<HTMLElement>();
  for (const node of doc.elementsFromPoint(x, y)) {
    if (node.closest("[data-layout-editor], [data-layout-resize]")) continue;
    const block = findBlock(node, doc);
    if (!block || !main.contains(block) || seen.has(block)) continue;
    seen.add(block);
    blocks.push(block);
  }
  return blocks;
}

function findBlock(start: Element | null, doc: Document) {
  if (!start || start.closest("[data-layout-editor]")) return null;
  if (start.closest("input, textarea, select, option")) return null;
  const main = doc.querySelector("main");
  if (!main) return null;
  let node: Element | null = start;
  while (node && node !== main) {
    if (isHtmlElement(node) && main.contains(node)) {
      if (node.tagName === "IMG" && isHtmlElement(node.parentElement))
        return node.parentElement;
      if (node.matches(BLOCK)) return node;
    }
    node = node.parentElement;
  }
  return null;
}

function labelFor(el: HTMLElement) {
  if (isPhotoFrame(el)) return "Zdjęcie";
  const labels: Record<string, string> = {
    H1: "Nagłówek",
    H2: "Nagłówek",
    H3: "Nagłówek",
    H4: "Nagłówek",
    P: "Akapit",
    IMG: "Zdjęcie",
    LI: "Element listy",
    A: "Link",
    BUTTON: "Przycisk",
    SECTION: "Sekcja",
    FIGURE: "Zdjęcie",
  };
  return labels[el.tagName] ?? "Blok";
}

type BoxPatch = {
  x?: number;
  y?: number;
  z?: number;
  paddingTop?: number;
  paddingBottom?: number;
  marginTop?: number;
  marginBottom?: number;
  fontSize?: number | null;
  width?: number | null;
  height?: number | null;
  breaks?: number[] | null;
};

function writeBox(
  pathname: string,
  size: SizeId,
  selector: string,
  patch: BoxPatch,
) {
  rememberHistory();
  const store = loadStore();
  const page: PageLayout = store[pathname] ?? {};
  const sizeMap = page[size] ?? {};
  const current = sizeMap[selector] ?? { x: 0, y: 0, z: 0 };
  const boxPatch: Partial<Box> = {};
  if (patch.x != null) boxPatch.x = patch.x;
  if (patch.y != null) boxPatch.y = patch.y;
  if (patch.z != null) boxPatch.z = patch.z;
  for (const key of [
    "paddingTop",
    "paddingBottom",
    "marginTop",
    "marginBottom",
  ] as const) {
    const value = patch[key];
    if (value != null) boxPatch[key] = value;
  }
  if (typeof patch.fontSize === "number") boxPatch.fontSize = patch.fontSize;
  if (typeof patch.width === "number") boxPatch.width = patch.width;
  if (typeof patch.height === "number") boxPatch.height = patch.height;
  if (patch.breaks && patch.breaks.length > 0) boxPatch.breaks = patch.breaks;
  const next = mergeBox(current, boxPatch);
  if (patch.fontSize === null) delete next.fontSize;
  if (patch.width === null) delete next.width;
  if (patch.height === null) delete next.height;
  if (patch.breaks === null) delete next.breaks;
  sizeMap[selector] = next;
  page[size] = sizeMap;
  store[pathname] = page;
  saveStore(store);
  return next;
}

type LineView = { text: string; canUp: boolean; canDown: boolean };

type TextView = {
  fontSize: number;
  customSize: boolean;
  width: number;
  customWidth: boolean;
  customBreaks: boolean;
  lines: LineView[];
};

type PhotoView = {
  width: number;
  height: number;
  customWidth: boolean;
  customHeight: boolean;
};

const RESIZE_LABELS: Record<"w" | "e" | "n" | "s", string> = {
  e: "Poszerz zdjęcie w prawo",
  w: "Poszerz zdjęcie w lewo",
  n: "Poszerz zdjęcie do góry",
  s: "Poszerz zdjęcie w dół",
};

function syncResizeFrame(doc: Document, el: HTMLElement | null) {
  const id = "uklad-resize";
  const layer = doc.getElementById(id);
  if (!el) {
    layer?.remove();
    return;
  }
  const frame = layer ?? doc.createElement("div");
  frame.id = id;
  frame.setAttribute("data-layout-editor", "1");
  const rect = el.getBoundingClientRect();
  frame.style.position = "fixed";
  frame.style.left = `${rect.left}px`;
  frame.style.top = `${rect.top}px`;
  frame.style.width = `${rect.width}px`;
  frame.style.height = `${Math.max(rect.height, 24)}px`;
  frame.style.zIndex = "60";
  frame.style.pointerEvents = "none";
  frame.replaceChildren();
  const photo = isPhotoFrame(el);
  const edges = photo ? (["w", "e", "n", "s"] as const) : (["w", "e"] as const);
  for (const edge of edges) {
    const handle = doc.createElement("button");
    handle.type = "button";
    handle.dataset["layoutResize"] = edge;
    handle.setAttribute(
      "aria-label",
      photo ? RESIZE_LABELS[edge] : edge === "e" ? "Rozciągnij ramkę w prawo" : "Rozciągnij ramkę w lewo",
    );
    handle.style.position = "absolute";
    handle.style.padding = "0";
    handle.style.border = "0";
    handle.style.background = "transparent";
    handle.style.pointerEvents = "auto";
    const bar = doc.createElement("span");
    bar.style.position = "absolute";
    bar.style.borderRadius = "999px";
    bar.style.background = "#b08954";
    bar.style.pointerEvents = "none";
    if (edge === "e" || edge === "w") {
      handle.style.top = "0";
      handle.style.bottom = "0";
      handle.style.width = "14px";
      handle.style.cursor = "ew-resize";
      if (edge === "e") handle.style.right = "-7px";
      else handle.style.left = "-7px";
      bar.style.top = "8px";
      bar.style.bottom = "8px";
      bar.style.left = "5px";
      bar.style.width = "3px";
    } else {
      handle.style.left = "0";
      handle.style.right = "0";
      handle.style.height = "14px";
      handle.style.cursor = "ns-resize";
      if (edge === "s") handle.style.bottom = "-7px";
      else handle.style.top = "-7px";
      bar.style.left = "8px";
      bar.style.right = "8px";
      bar.style.top = "5px";
      bar.style.height = "3px";
    }
    handle.appendChild(bar);
    frame.appendChild(handle);
  }
  if (!frame.parentElement) doc.body.appendChild(frame);
}

function photoView(el: HTMLElement, box: Box): PhotoView | null {
  if (!isPhotoFrame(el)) return null;
  const rect = el.getBoundingClientRect();
  return {
    width: box.width ?? Math.round(rect.width),
    height: box.height ?? Math.round(rect.height),
    customWidth: box.width != null,
    customHeight: box.height != null,
  };
}

function textView(el: HTMLElement, box: Box): TextView | null {
  if (!isTextBlock(el)) return null;
  const words = wordRanges(el).map((word) =>
    word.node.data.slice(word.start, word.end),
  );
  if (words.length === 0) return null;
  const customBreaks = !!box.breaks?.length;
  const indexes = customBreaks ? (box.breaks ?? []) : visualBreaks(el);
  const groups = linesFromBreaks(words.length, indexes);
  return {
    fontSize:
      box.fontSize ??
      Math.round(parseFloat(getComputedStyle(el).fontSize) || 16),
    customSize: box.fontSize != null,
    width: box.width ?? Math.round(el.getBoundingClientRect().width),
    customWidth: box.width != null,
    customBreaks,
    lines: groups.map((group, index) => ({
      text: group.map((wordIndex) => words[wordIndex] ?? "").join(" "),
      canUp: index > 0,
      canDown: group.length > 1,
    })),
  };
}

function writeText(
  pathname: string,
  selector: string,
  html: string,
  originalHtml: string,
) {
  rememberHistory();
  const store = loadStore();
  const page: PageLayout = store[pathname] ?? {};
  const text = page.text ?? {};
  const existing = text[selector];
  text[selector] = {
    html,
    originalHtml: existing?.originalHtml || originalHtml,
  };
  page.text = text;
  store[pathname] = page;
  saveStore(store);
}

function boxFor(pathname: string, size: SizeId, selector: string) {
  return layoutStore()[pathname]?.[size]?.[selector] ?? { x: 0, y: 0, z: 0 };
}

function paint(doc: Document, pathname: string, size: SizeId) {
  const store = layoutStore();
  const local = loadStore();
  if (applyLayout(doc, pathname, size, store)) saveStore(local);
  applyTheme(doc, pathname, store);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function readPanelBox(): { w: number; h: number | null } {
  try {
    const raw = localStorage.getItem(PANEL_KEY);
    if (!raw) return { w: 288, h: null };
    const parsed = JSON.parse(raw) as { w?: unknown; h?: unknown };
    const w = typeof parsed.w === "number" ? parsed.w : 288;
    const h = typeof parsed.h === "number" ? parsed.h : null;
    return {
      w: clamp(w, 200, 480),
      h: h == null ? null : clamp(h, 180, 1200),
    };
  } catch {
    return { w: 288, h: null };
  }
}

function ensureOutline(doc: Document) {
  if (doc.getElementById("uklad-style")) return;
  const style = doc.createElement("style");
  style.id = "uklad-style";
  style.textContent = OUTLINE_STYLE;
  doc.head.appendChild(style);
}

export function LayoutEditor() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const [enabled, setEnabled] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [panelBox, setPanelBox] = useState(readPanelBox);
  const [canUndo, setCanUndo] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [selectedSelector, setSelectedSelector] = useState<string | null>(null);
  const [textInfo, setTextInfo] = useState<TextView | null>(null);
  const [photoInfo, setPhotoInfo] = useState<PhotoView | null>(null);
  const [previewSize, setPreviewSize] = useState<SizeId | "okno">("okno");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [framePath, setFramePath] = useState(pathname);
  const [frameTick, setFrameTick] = useState(0);
  const [viewport, setViewport] = useState({ w: 1280, h: 800 });
  const [fileReady, setFileReady] = useState(0);
  const selectedSelectorRef = useRef<string | null>(null);
  const refreshTextRef = useRef<(selector: string | null) => void>(() => {});
  const syncResizeRef = useRef<(selector: string | null) => void>(() => {});
  const frameRef = useRef<HTMLIFrameElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelBoxRef = useRef(panelBox);
  const resizeRef = useRef<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  panelBoxRef.current = panelBox;
  const savedSnapshot = useRef("{}");
  const editPath = previewSize === "okno" ? pathname : framePath;
  const activeSize: SizeId =
    previewSize === "okno" ? sizeForWidth(viewport.w) : previewSize;
  const editPathRef = useRef(editPath);
  const activeSizeRef = useRef(activeSize);
  editPathRef.current = editPath;
  activeSizeRef.current = activeSize;

  const currentDoc = () =>
    previewSize === "okno"
      ? document
      : (frameRef.current?.contentDocument ?? null);

  const refreshText = (selector: string | null) => {
    syncResizeRef.current(selector);
    if (!selector) {
      setTextInfo(null);
      setPhotoInfo(null);
      return;
    }
    const el = currentDoc()?.querySelector("main")?.querySelector(selector);
    if (!isHtmlElement(el)) {
      setTextInfo(null);
      setPhotoInfo(null);
      return;
    }
    const box = boxFor(editPathRef.current, activeSizeRef.current, selector);
    setTextInfo(textView(el, box));
    setPhotoInfo(photoView(el, box));
  };
  refreshTextRef.current = refreshText;

  useEffect(() => {
    migrateAboutSections();
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    const sync = () => {
      const nextDirty = stableLayout(loadStore()) !== savedSnapshot.current;
      setDirty(nextDirty);
      if (nextDirty)
        setSaveState((state) => (state === "saving" ? state : "idle"));
      setCanUndo(loadHistory().length > 0);
    };
    sync();
    void fetch("/__uklad")
      .then(async (response) => {
        if (!response.ok) return;
        const layout = normalizeLayout(await response.json());
        publishedLayout = layout;
        savedSnapshot.current = stableLayout(layout);
        if (localStorage.getItem(STORAGE_KEY) == null) saveStore(layout);
        setDirty(stableLayout(loadStore()) !== savedSnapshot.current);
        setFileReady((value) => value + 1);
      })
      .catch(() => {});
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener(HISTORY_EVENT, sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener(HISTORY_EVENT, sync);
    };
  }, []);

  useEffect(() => {
    const onResize = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (previewSize === "okno") {
      delete document.body.dataset["layoutFrame"];
      return;
    }
    document.body.dataset["layoutFrame"] = "1";
    return () => {
      delete document.body.dataset["layoutFrame"];
    };
  }, [previewSize]);

  useEffect(() => {
    selectedSelectorRef.current = null;
    setSelectedSelector(null);
    setSelectedLabel(null);
    setTextInfo(null);
    setPhotoInfo(null);
    const doc =
      previewSize === "okno" ? document : frameRef.current?.contentDocument;
    doc
      ?.querySelectorAll("[data-layout-selected], [data-layout-hover]")
      .forEach((el) => {
        el.removeAttribute("data-layout-selected");
        el.removeAttribute("data-layout-hover");
      });
  }, [editPath, previewSize]);

  useEffect(() => {
    if (previewSize === "okno") return;
    const read = () => {
      const path = frameRef.current?.contentWindow?.location.pathname;
      if (!path) return;
      setFramePath((current) => (current === path ? current : path));
    };
    read();
    const id = window.setInterval(read, 400);
    return () => window.clearInterval(id);
  }, [previewSize, frameTick]);

  useEffect(() => {
    let observer: MutationObserver | null = null;
    let paintFrame = 0;
    let timer = 0;
    let attempts = 0;
    const run = () => {
      const doc =
        previewSize === "okno" ? document : frameRef.current?.contentDocument;
      if (!doc) return false;
      ensureOutline(doc);
      const main = doc.querySelector("main");
      if (!main) return false;
      paint(doc, editPathRef.current, activeSizeRef.current);
      const schedulePaint = () => {
        if (paintFrame) return;
        paintFrame = window.requestAnimationFrame(() => {
          paintFrame = 0;
          if (!isApplying())
            paint(doc, editPathRef.current, activeSizeRef.current);
        });
      };
      if (!observer) {
        observer = new MutationObserver(() => schedulePaint());
        observer.observe(main, {
          childList: true,
          subtree: true,
          attributes: false,
        });
      }
      return true;
    };
    if (!run()) {
      timer = window.setInterval(() => {
        attempts += 1;
        if (run() || attempts > 30) window.clearInterval(timer);
      }, 100);
    }
    return () => {
      window.clearInterval(timer);
      observer?.disconnect();
    };
  }, [previewSize, editPath, activeSize, frameTick, fileReady]);

  useEffect(() => {
    const doc =
      previewSize === "okno" ? document : frameRef.current?.contentDocument;
    const view = doc?.defaultView;
    if (!enabled || collapsed || !doc || !view) {
      if (doc) syncResizeFrame(doc, null);
      doc
        ?.querySelectorAll("[data-layout-hover], [data-layout-selected]")
        .forEach((el) => {
          el.removeAttribute("data-layout-hover");
          el.removeAttribute("data-layout-selected");
        });
      return;
    }

    const main = doc.querySelector("main");
    if (!main) return;
    ensureOutline(doc);

    let hovered: HTMLElement | null = null;
    let drag: {
      el: HTMLElement;
      selector: string;
      startX: number;
      startY: number;
      originX: number;
      originY: number;
      moved: boolean;
    } | null = null;
    let stretch: {
      selector: string;
      edge: "e" | "w" | "n" | "s";
      startX: number;
      startY: number;
      startWidth: number;
      startHeight: number;
      originX: number;
      originY: number;
      photo: boolean;
    } | null = null;
    let suppressClick = false;

    const syncResize = (selector: string | null) => {
      const el = selector ? main.querySelector(selector) : null;
      if (!isHtmlElement(el) || !isStretchBlock(el)) {
        syncResizeFrame(doc, null);
        return;
      }
      syncResizeFrame(doc, el);
    };
    syncResizeRef.current = syncResize;

    const markSelected = (selector: string | null) => {
      doc
        .querySelectorAll("[data-layout-selected]")
        .forEach((el) => el.removeAttribute("data-layout-selected"));
      if (!selector) return;
      const el = main.querySelector(selector);
      if (isHtmlElement(el)) el.dataset["layoutSelected"] = "1";
    };

    const select = (el: HTMLElement) => {
      const selector = selectorFor(el, main);
      if (!selector) return null;
      selectedSelectorRef.current = selector;
      setSelectedSelector(selector);
      setSelectedLabel(labelFor(el));
      markSelected(selector);
      refreshTextRef.current(selector);
      return selector;
    };

    const blockLayoutTarget = (event: Event) => {
      const pointed = eventTargetElement(event.target);
      if (!pointed || !main.contains(pointed)) return null;
      if (pointed.closest("[data-layout-editor], [data-layout-resize]"))
        return null;
      return findBlock(pointed, doc);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const pointed = eventTargetElement(event.target);
      if (!pointed) return;
      const handle = pointed.closest("[data-layout-resize]");
      if (isHtmlElement(handle)) {
        const edge = handle.dataset["layoutResize"];
        const selector = selectedSelectorRef.current;
        const target = selector ? main.querySelector(selector) : null;
        if (
          !isHtmlElement(target) ||
          !selector ||
          (edge !== "e" &&
            edge !== "w" &&
            edge !== "n" &&
            edge !== "s")
        )
          return;
        if (
          (edge === "n" || edge === "s") &&
          !isPhotoFrame(target)
        )
          return;
        event.preventDefault();
        event.stopPropagation();
        const box = boxFor(
          editPathRef.current,
          activeSizeRef.current,
          selector,
        );
        const rect = target.getBoundingClientRect();
        stretch = {
          selector,
          edge,
          startX: event.clientX,
          startY: event.clientY,
          startWidth: Math.round(rect.width),
          startHeight: Math.round(rect.height),
          originX: box.x,
          originY: box.y,
          photo: isPhotoFrame(target),
        };
        return;
      }
      if (pointed.closest("[data-layout-editor]")) return;
      const stacked = blocksUnderPoint(doc, main, event.clientX, event.clientY);
      const photosAtPoint = stacked.filter(isPhotoFrame);
      let el = stacked[0] ?? findBlock(pointed, doc);
      if (photosAtPoint.length > 1) {
        const currentEl = selectedSelectorRef.current
          ? main.querySelector(selectedSelectorRef.current)
          : null;
        const currentIndex =
          isHtmlElement(currentEl) && photosAtPoint.includes(currentEl)
            ? photosAtPoint.indexOf(currentEl)
            : -1;
        el = photosAtPoint[(currentIndex + 1) % photosAtPoint.length] ?? el;
      } else if (photosAtPoint.length === 1) {
        el = photosAtPoint[0] ?? el;
      }
      if (!el || el.isContentEditable) return;
      const selector = select(el);
      if (!selector) return;
      const change = boxFor(
        editPathRef.current,
        activeSizeRef.current,
        selector,
      );
      drag = {
        el,
        selector,
        startX: event.clientX,
        startY: event.clientY,
        originX: change.x,
        originY: change.y,
        moved: false,
      };
      if (
        el.tagName === "A" ||
        el.tagName === "BUTTON" ||
        el.querySelector("img") ||
        el.tagName === "IMG"
      ) {
        event.preventDefault();
      }
    };

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const el = blockLayoutTarget(event);
      if (!el) return;
      if (el.tagName === "A" || el.tagName === "BUTTON") event.preventDefault();
    };

    const onDragStart = (event: DragEvent) => {
      if (!blockLayoutTarget(event)) return;
      event.preventDefault();
    };

    const onPointerMove = (event: PointerEvent) => {
      const pointed = eventTargetElement(event.target);
      const next = pointed ? findBlock(pointed, doc) : null;
      if (hovered !== next) {
        hovered?.removeAttribute("data-layout-hover");
        if (next && next.dataset["layoutSelected"] !== "1")
          next.dataset["layoutHover"] = "1";
        hovered = next;
      }
      if (stretch) {
        const ratio =
          stretch.startHeight / Math.max(stretch.startWidth, 1);
        if (stretch.photo) {
          const horizontal = stretch.edge === "e" || stretch.edge === "w";
          const delta = horizontal
            ? event.clientX - stretch.startX
            : event.clientY - stretch.startY;
          const grow =
            stretch.edge === "e" || stretch.edge === "s" ? delta : -delta;
          const width = clamp(
            Math.round(stretch.startWidth + (horizontal ? grow : grow / ratio)),
            80,
            1600,
          );
          const height = clamp(Math.round(width * ratio), 40, 1600);
          writeBox(editPathRef.current, activeSizeRef.current, stretch.selector, {
            width,
            height,
            breaks: null,
            ...(stretch.edge === "w"
              ? { x: Math.round(stretch.originX + (stretch.startWidth - width)) }
              : {}),
            ...(stretch.edge === "n"
              ? { y: Math.round(stretch.originY + (stretch.startHeight - height)) }
              : {}),
          });
        } else if (stretch.edge === "e" || stretch.edge === "w") {
          const dx = event.clientX - stretch.startX;
          const raw =
            stretch.edge === "e"
              ? stretch.startWidth + dx
              : stretch.startWidth - dx;
          const width = clamp(Math.round(raw), 80, 1600);
          writeBox(editPathRef.current, activeSizeRef.current, stretch.selector, {
            width,
            breaks: null,
            ...(stretch.edge === "w"
              ? { x: Math.round(stretch.originX + (stretch.startWidth - width)) }
              : {}),
          });
        } else {
          const dy = event.clientY - stretch.startY;
          const raw =
            stretch.edge === "s"
              ? stretch.startHeight + dy
              : stretch.startHeight - dy;
          const height = clamp(Math.round(raw), 80, 1600);
          writeBox(editPathRef.current, activeSizeRef.current, stretch.selector, {
            height,
            ...(stretch.edge === "n"
              ? { y: Math.round(stretch.originY + (stretch.startHeight - height)) }
              : {}),
          });
        }
        paint(doc, editPathRef.current, activeSizeRef.current);
        syncResize(stretch.selector);
        refreshTextRef.current(stretch.selector);
        return;
      }
      if (!drag) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) < 4) return;
      drag.moved = true;
      suppressClick = true;
      const current = boxFor(
        editPathRef.current,
        activeSizeRef.current,
        drag.selector,
      );
      const box = writeBox(
        editPathRef.current,
        activeSizeRef.current,
        drag.selector,
        {
          x: Math.round(drag.originX + dx),
          y: Math.round(drag.originY + dy),
          z: Math.max(current.z, 2),
        },
      );
      if (box) paint(doc, editPathRef.current, activeSizeRef.current);
      syncResize(drag.selector);
    };

    const onPointerUp = () => {
      drag = null;
      stretch = null;
      finishStep();
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      const pointed = eventTargetElement(target);
      if (!pointed || !main.contains(pointed)) return;
      if (suppressClick || pointed.closest("a, button")) {
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
      }
    };

    const onDoubleClick = (event: MouseEvent) => {
      const target = event.target;
      const pointed = eventTargetElement(target);
      if (!pointed) return;
      const el = findBlock(pointed, doc);
      if (!el || el.querySelector("img")) return;
      event.preventDefault();
      event.stopPropagation();
      const selector = select(el);
      if (!selector) return;
      const original =
        loadStore()[editPathRef.current]?.text?.[selector]?.originalHtml ??
        htmlWithoutLines(el);
      el.contentEditable = "true";
      el.focus();
      const finish = () => {
        el.contentEditable = "false";
        writeText(
          editPathRef.current,
          selector,
          htmlWithoutLines(el),
          original,
        );
        finishStep();
        paint(doc, editPathRef.current, activeSizeRef.current);
        refreshTextRef.current(selector);
        el.removeEventListener("blur", finish);
        el.removeEventListener("keydown", onKey);
      };
      const onKey = (keyEvent: KeyboardEvent) => {
        if (keyEvent.key === "Enter" && !keyEvent.shiftKey) {
          keyEvent.preventDefault();
          el.blur();
        }
        if (keyEvent.key === "Escape") el.blur();
      };
      el.addEventListener("blur", finish);
      el.addEventListener("keydown", onKey);
    };

    const onScroll = () => syncResize(selectedSelectorRef.current);
    doc.body.dataset["layoutEditing"] = "1";
    markSelected(selectedSelectorRef.current);
    syncResize(selectedSelectorRef.current);
    doc.addEventListener("pointerdown", onPointerDown, true);
    main.addEventListener("mousedown", onMouseDown, true);
    view.addEventListener("pointermove", onPointerMove);
    view.addEventListener("pointerup", onPointerUp);
    view.addEventListener("dragstart", onDragStart, true);
    view.addEventListener("click", onClick, true);
    view.addEventListener("dblclick", onDoubleClick, true);
    window.addEventListener("pointerup", onPointerUp);
    doc.addEventListener("scroll", onScroll, true);
    return () => {
      delete doc.body.dataset["layoutEditing"];
      doc.removeEventListener("pointerdown", onPointerDown, true);
      main.removeEventListener("mousedown", onMouseDown, true);
      view.removeEventListener("pointermove", onPointerMove);
      view.removeEventListener("pointerup", onPointerUp);
      view.removeEventListener("dragstart", onDragStart, true);
      view.removeEventListener("click", onClick, true);
      view.removeEventListener("dblclick", onDoubleClick, true);
      window.removeEventListener("pointerup", onPointerUp);
      doc.removeEventListener("scroll", onScroll, true);
      hovered?.removeAttribute("data-layout-hover");
      syncResizeFrame(doc, null);
      syncResizeRef.current = () => {};
    };
  }, [enabled, collapsed, previewSize, frameTick]);

  const applyCurrent = () => {
    const doc = currentDoc();
    if (!doc) return;
    paint(doc, editPath, activeSize);
    syncResizeRef.current(selectedSelectorRef.current);
  };

  const nudge = (dx: number, dy: number) => {
    const selector = selectedSelectorRef.current;
    if (!selector) return;
    const current = boxFor(editPath, activeSize, selector);
    writeBox(editPath, activeSize, selector, {
      x: current.x + dx,
      y: current.y + dy,
    });
    finishStep();
    applyCurrent();
  };

  const spacingCssProp = (prop: "paddingTop" | "paddingBottom" | "marginTop" | "marginBottom") => {
    const map = {
      paddingTop: "padding-top",
      paddingBottom: "padding-bottom",
      marginTop: "margin-top",
      marginBottom: "margin-bottom",
    } as const;
    return map[prop];
  };

  const applySectionSpacingStyle = (
    target: HTMLElement,
    paddingProp: "paddingTop" | "paddingBottom",
    marginProp: "marginTop" | "marginBottom",
    padding: number,
    margin: number,
  ) => {
    target.style.setProperty(
      spacingCssProp(paddingProp),
      `${padding}px`,
      "important",
    );
    target.style.setProperty(
      spacingCssProp(marginProp),
      `${margin}px`,
      "important",
    );
  };

  const adjustSpace = (edge: "top" | "bottom", delta: number) => {
    const main = currentDoc()?.querySelector("main");
    if (!main) return;
    let selector = selectedSelectorRef.current;
    if (!selector) {
      const marked = main.querySelector("[data-layout-selected='1']");
      if (isHtmlElement(marked)) selector = selectorFor(marked, main);
    }
    if (!selector) return;
    const el = main.querySelector(selector);
    if (!isHtmlElement(el)) return;
    const target = sectionForSpacing(el, main);
    const targetSelector = selectorFor(target, main);
    if (!targetSelector) return;
    const paddingProp = edge === "bottom" ? "paddingBottom" : "paddingTop";
    const marginProp = edge === "bottom" ? "marginBottom" : "marginTop";
    const { padding: startPadding, margin: startMargin } = readVerticalSpacing(
      target,
      edge,
    );
    let padding = startPadding;
    let margin = startMargin;
    let remaining = delta;

    if (remaining > 0 && margin < 0) {
      const absorbed = Math.min(remaining, -margin);
      margin += absorbed;
      remaining -= absorbed;
    }
    if (remaining > 0) {
      padding += remaining;
    } else if (remaining < 0) {
      const fromPadding = Math.min(padding, -remaining);
      padding -= fromPadding;
      remaining += fromPadding;
      if (remaining < 0) margin += remaining;
    }

    padding = Math.round(padding);
    margin = Math.round(margin);

    const spacingPatch = {
      [paddingProp]: padding,
      [marginProp]: margin,
    } as BoxPatch;
    rememberHistory();
    const path = editPathRef.current;
    const store = loadStore();
    const page: PageLayout = store[path] ?? {};
    for (const size of SIZE_ORDER) {
      const sizeMap = page[size] ?? {};
      const current = sizeMap[targetSelector] ?? { x: 0, y: 0, z: 0 };
      sizeMap[targetSelector] = mergeBox(current, spacingPatch);
      page[size] = sizeMap;
    }
    store[path] = page;
    saveStore(store);
    applySectionSpacingStyle(target, paddingProp, marginProp, padding, margin);
    if (targetSelector !== selector) {
      selectedSelectorRef.current = targetSelector;
      setSelectedSelector(targetSelector);
      setSelectedLabel(labelFor(target));
    }
    finishStep();
    applyCurrent();
    refreshText(targetSelector);
  };

  const fold = (next: boolean) => {
    setCollapsed(next);
    localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
  };

  const rememberPanel = (next: { w: number; h: number | null }) => {
    localStorage.setItem(PANEL_KEY, JSON.stringify(next));
    setPanelBox(next);
  };

  const shrinkPanel = () => {
    const currentH = panelBox.h ?? panelRef.current?.offsetHeight ?? 420;
    rememberPanel({
      w: clamp(panelBox.w - 48, 200, 480),
      h: clamp(currentH - 96, 180, Math.round(window.innerHeight * 0.92)),
    });
  };

  const growPanel = () => {
    const currentH = panelBox.h ?? panelRef.current?.offsetHeight ?? 420;
    const w = clamp(panelBox.w + 48, 200, 480);
    const h = currentH + 96;
    if (w >= 288 && h >= window.innerHeight * 0.78) {
      rememberPanel({ w, h: null });
      return;
    }
    rememberPanel({
      w,
      h: clamp(h, 180, Math.round(window.innerHeight * 0.92)),
    });
  };

  const onResizePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeRef.current = {
      x: event.clientX,
      y: event.clientY,
      w: panelRef.current?.offsetWidth ?? panelBox.w,
      h: panelRef.current?.offsetHeight ?? 420,
    };
  };

  const onResizePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = resizeRef.current;
    if (!start) return;
    const next = {
      w: clamp(Math.round(start.w + event.clientX - start.x), 200, 480),
      h: clamp(
        Math.round(start.h + start.y - event.clientY),
        180,
        Math.round(window.innerHeight * 0.92),
      ),
    };
    panelBoxRef.current = next;
    setPanelBox(next);
  };

  const onResizePointerUp = () => {
    if (!resizeRef.current) return;
    resizeRef.current = null;
    localStorage.setItem(PANEL_KEY, JSON.stringify(panelBoxRef.current));
  };

  const lift = () => {
    if (!selectedSelector) return;
    const current = boxFor(editPath, activeSize, selectedSelector);
    writeBox(editPath, activeSize, selectedSelector, { z: current.z + 1 });
    finishStep();
    applyCurrent();
  };

  const resetSelected = () => {
    if (!selectedSelector) return;
    rememberHistory();
    const store = loadStore();
    const page = store[editPath];
    const sizeMap = page?.[activeSize];
    if (page && sizeMap) {
      delete sizeMap[selectedSelector];
      if (Object.keys(sizeMap).length === 0) delete page[activeSize];
      if (!page.sm && !page.md && !page.lg && !page.text)
        delete store[editPath];
      saveStore(store);
    }
    finishStep();
    const el = currentDoc()
      ?.querySelector("main")
      ?.querySelector(selectedSelector);
    if (isHtmlElement(el)) {
      clearBox(el);
      el.removeAttribute("data-layout-selected");
    }
    applyCurrent();
    selectedSelectorRef.current = null;
    setSelectedSelector(null);
    setSelectedLabel(null);
    setTextInfo(null);
    setPhotoInfo(null);
  };

  const resetSize = () => {
    rememberHistory();
    const store = loadStore();
    const page = store[editPath];
    if (page) {
      delete page[activeSize];
      if (!page.sm && !page.md && !page.lg && !page.text)
        delete store[editPath];
      saveStore(store);
    }
    finishStep();
    selectedSelectorRef.current = null;
    setSelectedSelector(null);
    setSelectedLabel(null);
    setTextInfo(null);
    setPhotoInfo(null);
    applyCurrent();
  };

  const changeFont = (direction: -1 | 1) => {
    if (!selectedSelector) return;
    const el = currentDoc()
      ?.querySelector("main")
      ?.querySelector(selectedSelector);
    if (!isHtmlElement(el) || !isTextBlock(el)) return;
    const box = boxFor(editPath, activeSize, selectedSelector);
    const current =
      box.fontSize ??
      Math.round(parseFloat(getComputedStyle(el).fontSize) || 16);
    const step = current >= 40 ? 4 : 2;
    writeBox(editPath, activeSize, selectedSelector, {
      fontSize: clamp(current + direction * step, 12, 240),
    });
    finishStep();
    applyCurrent();
    refreshText(selectedSelector);
  };

  const resetFont = () => {
    if (!selectedSelector) return;
    writeBox(editPath, activeSize, selectedSelector, { fontSize: null });
    finishStep();
    applyCurrent();
    refreshText(selectedSelector);
  };

  const resetWidth = () => {
    if (!selectedSelector) return;
    writeBox(editPath, activeSize, selectedSelector, { width: null });
    finishStep();
    applyCurrent();
    refreshText(selectedSelector);
  };

  const resetHeight = () => {
    if (!selectedSelector) return;
    writeBox(editPath, activeSize, selectedSelector, { height: null });
    finishStep();
    applyCurrent();
    refreshText(selectedSelector);
  };

  const resetPhotoSize = () => {
    if (!selectedSelector) return;
    writeBox(editPath, activeSize, selectedSelector, {
      width: null,
      height: null,
    });
    finishStep();
    applyCurrent();
    refreshText(selectedSelector);
  };

  const moveWord = (lineIndex: number, direction: -1 | 1) => {
    if (!selectedSelector) return;
    const el = currentDoc()
      ?.querySelector("main")
      ?.querySelector(selectedSelector);
    if (!isHtmlElement(el) || !isTextBlock(el)) return;
    const box = boxFor(editPath, activeSize, selectedSelector);
    const count = wordRanges(el).length;
    const base = box.breaks?.length ? box.breaks : visualBreaks(el);
    const next = moveLineWord(count, base, lineIndex, direction);
    if (!next) return;
    writeBox(editPath, activeSize, selectedSelector, {
      breaks: next.length > 0 ? next : null,
    });
    finishStep();
    applyCurrent();
    refreshText(selectedSelector);
  };

  const resetBreaks = () => {
    if (!selectedSelector) return;
    writeBox(editPath, activeSize, selectedSelector, { breaks: null });
    finishStep();
    applyCurrent();
    refreshText(selectedSelector);
  };

  const undo = () => {
    const doc = currentDoc();
    if (!doc) return;
    const history = loadHistory();
    const previous = history.pop();
    if (!previous) return;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    saveStore(previous);
    if (applyLayout(doc, editPath, activeSize, previous)) saveStore(previous);
    refreshText(selectedSelectorRef.current);
    window.dispatchEvent(new Event(HISTORY_EVENT));
  };

  const save = async () => {
    if (!import.meta.env.DEV) {
      setSaveState("error");
      return;
    }
    setSaveState("saving");
    try {
      const layout = layoutStore();
      const response = await fetch("/__uklad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(layout),
      });
      if (!response.ok) throw new Error("save");
      savedSnapshot.current = stableLayout(layout);
      setDirty(false);
      setSaveState("saved");
      applyCurrent();
    } catch {
      setSaveState("error");
    }
  };

  const openSize = (size: SizeId) => {
    if (previewSize === "okno") {
      setPreviewSrc(pathname);
      setFramePath(pathname);
    }
    setPreviewSize(size);
    frameRef.current?.contentWindow?.scrollTo(0, 0);
  };

  const closePreview = () => {
    const path = frameRef.current?.contentWindow?.location.pathname ?? pathname;
    setPreviewSize("okno");
    if (path !== window.location.pathname) window.location.assign(path);
  };

  const frame = previewSize === "okno" ? null : SIZE_META[previewSize];
  const frameHeight =
    previewSize === "sm" ? 780 : Math.max(640, viewport.h - 48);
  const previewScale = frame
    ? Math.max(
        0.45,
        Math.min(
          1,
          (viewport.w - (collapsed ? 24 : panelBox.w + 48)) / frame.width,
          (viewport.h - 24) / frameHeight,
        ),
      )
    : 1;
  const saveLabel =
    saveState === "saving"
      ? "Zapisuję…"
      : saveState === "error"
        ? "Spróbuj ponownie"
        : saveState === "saved" && !dirty
          ? "Zapisano"
          : "Zapisz";
  const sizeLabel =
    previewSize === "okno"
      ? `To okno: ${SIZE_META[activeSize].label}`
      : `Podgląd: ${SIZE_META[previewSize].label}`;
  const preview = frame ? (
    <div
      className="fixed inset-y-0 right-0 z-[70] overflow-auto bg-muted"
      style={{ left: collapsed ? 0 : panelBox.w + 32 }}
    >
      <div
        className="mx-auto my-4"
        style={{
          width: frame.width * previewScale,
          height: frameHeight * previewScale,
        }}
      >
        <iframe
          ref={frameRef}
          name="podglad"
          title="Podgląd strony"
          src={previewSrc ?? pathname}
          onLoad={() => setFrameTick((value) => value + 1)}
          className="origin-top-left rounded-2xl border border-border bg-background shadow-xl"
          style={{
            width: frame.width,
            height: frameHeight,
            transform: `scale(${previewScale})`,
          }}
        />
      </div>
    </div>
  ) : null;

  if (collapsed) {
    return (
      <>
        <style>{`body[data-layout-frame="1"] { overflow: hidden; } body[data-layout-frame="1"] header, body[data-layout-frame="1"] main, body[data-layout-frame="1"] footer { display: none !important; }`}</style>
        {preview}
        <div
          data-layout-editor
          className="fixed bottom-4 left-4 z-[80] flex items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-lg"
        >
          <button
            type="button"
            aria-label="Cofnij jeden krok"
            disabled={!canUndo}
            onClick={undo}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/95 text-lg shadow-lg backdrop-blur disabled:opacity-40"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => fold(false)}
            className="inline-flex h-11 items-center rounded-full border border-border bg-background/95 px-4 text-sm shadow-lg backdrop-blur"
          >
            Układ
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saveState === "saving"}
            className="inline-flex h-11 items-center rounded-full bg-primary px-4 text-sm text-primary-foreground shadow-lg disabled:opacity-60"
          >
            {saveLabel}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        ${OUTLINE_STYLE}
        body[data-layout-frame="1"] { overflow: hidden; }
        body[data-layout-frame="1"] header,
        body[data-layout-frame="1"] main,
        body[data-layout-frame="1"] footer { display: none !important; }
      `}</style>
      {preview}
      <div
        ref={panelRef}
        data-layout-editor
        className="fixed bottom-4 left-4 z-[80] overflow-y-auto rounded-md border border-border bg-card p-4 text-sm shadow-lg"
        style={{
          width: panelBox.w,
          height: panelBox.h ?? undefined,
          maxHeight: panelBox.h == null ? "78vh" : undefined,
        }}
      >
        <button
          type="button"
          aria-label="Zmień rozmiar panelu"
          onPointerDown={onResizePointerDown}
          onPointerMove={onResizePointerMove}
          onPointerUp={onResizePointerUp}
          className="absolute right-1 top-1 inline-flex h-6 w-6 cursor-nesw-resize items-center justify-center text-muted-foreground"
        >
          <span className="block h-3 w-3 border-r border-t border-current" />
        </button>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <button
              type="button"
              aria-label="Cofnij jeden krok"
              disabled={!canUndo}
              onClick={undo}
              className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-foreground/15 text-lg disabled:opacity-40"
            >
              ←
            </button>
            <div>
              <p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                Tymczasowe narzędzie
              </p>
              <p className="mt-1 font-display text-2xl">Układ strony</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1 pr-4">
            <button
              type="button"
              onClick={() => fold(true)}
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Zwiń
            </button>
            <div className="flex gap-1">
              <button
                type="button"
                aria-label="Zmniejsz panel"
                onClick={shrinkPanel}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-foreground/15 text-sm"
              >
                −
              </button>
              <button
                type="button"
                aria-label="Powiększ panel"
                onClick={growPanel}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-foreground/15 text-sm"
              >
                +
              </button>
            </div>
          </div>
        </div>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          Telefon, tablet i komputer mają osobne układy. Zapisz wpisuje je w kod
          strony.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {SIZE_ORDER.map((size) => (
            <button
              key={size}
              type="button"
              aria-pressed={previewSize === size}
              onClick={() => openSize(size)}
              className={`inline-flex h-9 items-center justify-center rounded-full border px-2 text-xs ${previewSize === size ? "border-primary bg-primary text-primary-foreground" : "border-foreground/15"}`}
            >
              {SIZE_META[size].label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{sizeLabel}</p>
        {previewSize !== "okno" && (
          <button
            type="button"
            onClick={closePreview}
            className="mt-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Wróć do całego okna
          </button>
        )}
        <button
          type="button"
          onClick={() => void save()}
          disabled={saveState === "saving"}
          className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full bg-primary px-4 text-sm text-primary-foreground transition-colors hover:bg-honey disabled:opacity-60"
        >
          {saveLabel}
        </button>
        {saveState === "error" && (
          <p className="mt-2 text-xs text-muted-foreground">
            {import.meta.env.DEV
              ? "Zapis nie doszedł. Uruchom npm run dev (nie preview) i spróbuj ponownie."
              : "Zapis działa tylko w trybie developerskim (npm run dev)."}
          </p>
        )}
        <button
          type="button"
          onClick={() => setEnabled((value) => !value)}
          className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full border border-foreground/15 px-4 text-sm"
        >
          {enabled ? "Wyłącz edycję" : "Włącz edycję"}
        </button>
        {enabled && (
          <div className="mt-4 space-y-3">
            <p className="leading-relaxed text-muted-foreground">
              Przeciągnij blok, żeby go przenieść. Złap krawędź ramki tekstu i
              rozciągnij — słowa same przejdą między linijkami. Zdjęcie możesz
              powiększać i pomniejszać za krawędzie z boku i z góry/dołu. Dwuklik
              zmienia treść.
            </p>
            <p className="text-muted-foreground">
              {selectedLabel
                ? `Zaznaczone: ${selectedLabel}`
                : "Nic nie jest zaznaczone."}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <ToolButton
                disabled={!selectedSelector}
                onClick={() => nudge(0, -4)}
              >
                Wyżej
              </ToolButton>
              <ToolButton
                disabled={!selectedSelector}
                onClick={() => nudge(0, 4)}
              >
                Niżej
              </ToolButton>
              <ToolButton
                disabled={!selectedSelector}
                onClick={() => nudge(-16, 0)}
              >
                W lewo
              </ToolButton>
              <ToolButton
                disabled={!selectedSelector}
                onClick={() => nudge(16, 0)}
              >
                W prawo
              </ToolButton>
            </div>
            {!selectedSelector && (
              <p className="text-xs leading-snug text-muted-foreground">
                Kliknij blok w sekcji (tekst, nagłówek), potem zmieniaj odstęp
                sekcji.
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <ToolButton onClick={() => adjustSpace("bottom", -24)}>
                Mniej pod sekcją
              </ToolButton>
              <ToolButton onClick={() => adjustSpace("bottom", 24)}>
                Więcej pod sekcją
              </ToolButton>
              <ToolButton onClick={() => adjustSpace("top", -24)}>
                Mniej nad sekcją
              </ToolButton>
              <ToolButton onClick={() => adjustSpace("top", 24)}>
                Więcej nad sekcją
              </ToolButton>
            </div>
            <ToolButton disabled={!selectedSelector} onClick={lift}>
              Na wierzch
            </ToolButton>
            <ToolButton disabled={!selectedSelector} onClick={resetSelected}>
              Cofnij zaznaczenie
            </ToolButton>
            <ToolButton onClick={resetSize}>Cofnij ten rozmiar</ToolButton>
            {photoInfo && (
              <div className="space-y-3 border-t border-border pt-3">
                <p className="text-muted-foreground">
                  Zdjęcie: {photoInfo.width} × {photoInfo.height} px
                </p>
                {(photoInfo.customWidth || photoInfo.customHeight) && (
                  <ToolButton onClick={resetPhotoSize}>
                    Rozmiar z projektu
                  </ToolButton>
                )}
                {photoInfo.customWidth && !photoInfo.customHeight && (
                  <ToolButton onClick={resetWidth}>Szerokość z projektu</ToolButton>
                )}
                {photoInfo.customHeight && !photoInfo.customWidth && (
                  <ToolButton onClick={resetHeight}>Wysokość z projektu</ToolButton>
                )}
              </div>
            )}
            {textInfo && (
              <div className="space-y-3 border-t border-border pt-3">
                <p className="text-muted-foreground">
                  Szerokość ramki: {textInfo.width} px
                </p>
                {textInfo.customWidth && (
                  <ToolButton onClick={resetWidth}>
                    Szerokość z projektu
                  </ToolButton>
                )}
                <p className="text-muted-foreground">
                  Rozmiar tekstu na tym ekranie: {textInfo.fontSize} px
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <ToolButton onClick={() => changeFont(-1)}>
                    Mniejszy
                  </ToolButton>
                  <ToolButton onClick={() => changeFont(1)}>Większy</ToolButton>
                </div>
                {textInfo.customSize && (
                  <ToolButton onClick={resetFont}>
                    Rozmiar z projektu
                  </ToolButton>
                )}
                <div className="space-y-2">
                  <p className="text-muted-foreground">Linijki</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Rozciąganie ramki układa tekst samo. Słowo wyżej bierze
                    pierwsze słowo linijki, słowo niżej ostatnie.
                  </p>
                  {textInfo.lines.map((line, index) => (
                    <div key={`${index}-${line.text}`} className="space-y-1">
                      <p className="break-words text-xs leading-snug">
                        {index + 1}. {line.text}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <ToolButton
                          disabled={!line.canUp}
                          onClick={() => moveWord(index, -1)}
                        >
                          Słowo wyżej
                        </ToolButton>
                        <ToolButton
                          disabled={!line.canDown}
                          onClick={() => moveWord(index, 1)}
                        >
                          Słowo niżej
                        </ToolButton>
                      </div>
                    </div>
                  ))}
                  {textInfo.customBreaks && (
                    <ToolButton onClick={resetBreaks}>Złącz linijki</ToolButton>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function ToolButton({
  children,
  onClick,
  disabled,
}: {
  children: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 w-full items-center justify-center rounded-full border border-foreground/15 px-3 text-xs disabled:opacity-40"
    >
      {children}
    </button>
  );
}
