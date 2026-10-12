import { useRouterState } from "@tanstack/react-router";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  applyLayout,
  clearBox,
  htmlWithoutLines,
  isApplying,
  isHtmlElement,
  isTextBlock,
  linesFromBreaks,
  moveLineWord,
  visualBreaks,
  wordRanges,
} from "@/lib/uklad-dom";
import {
  mergeBox,
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
const BLOCK =
  "section, h1, h2, h3, h4, p, li, figure, a, button, img, div.rounded-2xl, div.rounded-md";
const OUTLINE_STYLE = `
  [data-layout-hover="1"] { outline: 1px dashed #b08954; outline-offset: 4px; }
  [data-layout-selected="1"] { outline: 2px solid #b08954; outline-offset: 4px; }
  [contenteditable="true"] { outline: 2px solid #8c6a3d; outline-offset: 4px; cursor: text; }
`;

let stepRecorded = false;

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw == null ? {} : normalizeLayout(JSON.parse(raw));
  } catch {
    return {};
  }
}

function saveStore(store: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(CHANGE_EVENT));
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
  if (patch.breaks && patch.breaks.length > 0) boxPatch.breaks = patch.breaks;
  const next = mergeBox(current, boxPatch);
  if (patch.fontSize === null) delete next.fontSize;
  if (patch.width === null) delete next.width;
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
  if (!frame.querySelector("[data-layout-resize]")) {
    for (const edge of ["w", "e"] as const) {
      const handle = doc.createElement("button");
      handle.type = "button";
      handle.dataset["layoutResize"] = edge;
      handle.setAttribute(
        "aria-label",
        edge === "e" ? "Rozciągnij ramkę w prawo" : "Rozciągnij ramkę w lewo",
      );
      handle.style.position = "absolute";
      handle.style.top = "0";
      handle.style.bottom = "0";
      handle.style.width = "14px";
      handle.style.padding = "0";
      handle.style.border = "0";
      handle.style.background = "transparent";
      handle.style.pointerEvents = "auto";
      handle.style.cursor = "ew-resize";
      if (edge === "e") handle.style.right = "-7px";
      else handle.style.left = "-7px";
      const bar = doc.createElement("span");
      bar.style.position = "absolute";
      bar.style.top = "8px";
      bar.style.bottom = "8px";
      bar.style.left = "5px";
      bar.style.width = "3px";
      bar.style.borderRadius = "999px";
      bar.style.background = "#b08954";
      bar.style.pointerEvents = "none";
      handle.appendChild(bar);
      frame.appendChild(handle);
    }
  }
  if (!frame.parentElement) doc.body.appendChild(frame);
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
  return loadStore()[pathname]?.[size]?.[selector] ?? { x: 0, y: 0, z: 0 };
}

function paint(doc: Document, pathname: string, size: SizeId) {
  const store = loadStore();
  if (applyLayout(doc, pathname, size, store)) saveStore(store);
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
      return;
    }
    const el = currentDoc()?.querySelector("main")?.querySelector(selector);
    if (!isHtmlElement(el)) {
      setTextInfo(null);
      return;
    }
    setTextInfo(
      textView(
        el,
        boxFor(editPathRef.current, activeSizeRef.current, selector),
      ),
    );
  };
  refreshTextRef.current = refreshText;

  useEffect(() => {
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
    const doc =
      previewSize === "okno" ? document : frameRef.current?.contentDocument;
    doc
      ?.querySelectorAll("[data-layout-selected], [data-layout-hover]")
      .forEach((el) => {
        el.removeAttribute("data-layout-selected");
        el.removeAttribute("data-layout-hover");
      });
  }, [editPath, activeSize, previewSize]);

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
      if (!observer) {
        observer = new MutationObserver(() => {
          if (!isApplying())
            paint(doc, editPathRef.current, activeSizeRef.current);
        });
        observer.observe(main, { childList: true, subtree: true });
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
      edge: "e" | "w";
      startX: number;
      startWidth: number;
      originX: number;
    } | null = null;
    let suppressClick = false;

    const syncResize = (selector: string | null) => {
      const el = selector ? main.querySelector(selector) : null;
      if (!isHtmlElement(el) || !isTextBlock(el)) {
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
          (edge !== "e" && edge !== "w")
        )
          return;
        event.preventDefault();
        event.stopPropagation();
        const box = boxFor(
          editPathRef.current,
          activeSizeRef.current,
          selector,
        );
        stretch = {
          selector,
          edge,
          startX: event.clientX,
          startWidth: Math.round(target.getBoundingClientRect().width),
          originX: box.x,
        };
        return;
      }
      const el = findBlock(pointed, doc);
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
      if (el.querySelector("img") || el.tagName === "IMG")
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
    markSelected(selectedSelectorRef.current);
    syncResize(selectedSelectorRef.current);
    view.addEventListener("pointerdown", onPointerDown);
    view.addEventListener("pointermove", onPointerMove);
    view.addEventListener("pointerup", onPointerUp);
    view.addEventListener("click", onClick, true);
    view.addEventListener("dblclick", onDoubleClick, true);
    window.addEventListener("pointerup", onPointerUp);
    doc.addEventListener("scroll", onScroll, true);
    return () => {
      view.removeEventListener("pointerdown", onPointerDown);
      view.removeEventListener("pointermove", onPointerMove);
      view.removeEventListener("pointerup", onPointerUp);
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
    if (!selectedSelector) return;
    const current = boxFor(editPath, activeSize, selectedSelector);
    writeBox(editPath, activeSize, selectedSelector, {
      x: current.x + dx,
      y: current.y + dy,
    });
    finishStep();
    applyCurrent();
  };

  const adjustSpace = (edge: "top" | "bottom", delta: number) => {
    if (!selectedSelector) return;
    const main = currentDoc()?.querySelector("main");
    const el = main?.querySelector(selectedSelector);
    if (!isHtmlElement(el)) return;
    const paddingProp = edge === "bottom" ? "paddingBottom" : "paddingTop";
    const marginProp = edge === "bottom" ? "marginBottom" : "marginTop";
    const style = getComputedStyle(el);
    const padding =
      parseFloat(edge === "bottom" ? style.paddingBottom : style.paddingTop) ||
      0;
    if (delta < 0 && padding <= 0) {
      const margin =
        parseFloat(edge === "bottom" ? style.marginBottom : style.marginTop) ||
        0;
      writeBox(editPath, activeSize, selectedSelector, {
        [marginProp]: Math.round(margin + delta),
      });
    } else {
      writeBox(editPath, activeSize, selectedSelector, {
        [paddingProp]: Math.max(0, Math.round(padding + delta)),
      });
    }
    finishStep();
    applyCurrent();
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
    setSaveState("saving");
    try {
      const layout = loadStore();
      const response = await fetch("/__uklad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(layout),
      });
      if (!response.ok) throw new Error("save");
      savedSnapshot.current = stableLayout(layout);
      setDirty(false);
      setSaveState("saved");
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
          className="fixed bottom-4 left-4 z-[80] flex items-center gap-2"
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
        className="fixed bottom-4 left-4 z-[80] overflow-y-auto rounded-md border border-border bg-background/95 p-4 text-sm shadow-lg backdrop-blur"
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
            Zapis nie doszedł. Zostaw włączoną stronę developerską i spróbuj
            jeszcze raz.
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
              rozciągnij — słowa same przejdą między linijkami. Dwuklik zmienia
              treść.
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
            <div className="grid grid-cols-2 gap-2">
              <ToolButton
                disabled={!selectedSelector}
                onClick={() => adjustSpace("bottom", -24)}
              >
                Mniej pod
              </ToolButton>
              <ToolButton
                disabled={!selectedSelector}
                onClick={() => adjustSpace("bottom", 24)}
              >
                Więcej pod
              </ToolButton>
              <ToolButton
                disabled={!selectedSelector}
                onClick={() => adjustSpace("top", -24)}
              >
                Mniej nad
              </ToolButton>
              <ToolButton
                disabled={!selectedSelector}
                onClick={() => adjustSpace("top", 24)}
              >
                Więcej nad
              </ToolButton>
            </div>
            <ToolButton disabled={!selectedSelector} onClick={lift}>
              Na wierzch
            </ToolButton>
            <ToolButton disabled={!selectedSelector} onClick={resetSelected}>
              Cofnij zaznaczenie
            </ToolButton>
            <ToolButton onClick={resetSize}>Cofnij ten rozmiar</ToolButton>
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
