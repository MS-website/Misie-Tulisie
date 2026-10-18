import bundledFile from "@/parents-layout-tune.json";
import { sizeForWidth, type SizeId } from "@/lib/uklad-data";

export type TuneOffset = { x: number; y: number; width?: number; scale?: number };

export const PARENTS_TUNE_IMAGE_BLOCKS = new Set([
  "oplaty-wyzywienie-foto",
  "oplaty-infografika",
]);

export type ParentsTuneStore = Record<string, Partial<Record<SizeId, TuneOffset>>>;

export type ParentsTuneDocument = {
  offsets: ParentsTuneStore;
  text: Record<string, string>;
};

export const PARENTS_TUNE_STORAGE_KEY = "misie-parents-tune-v3";

/** Bez zapisywanego HTML z tunera (React / szerokość ramki zamiast &nbsp; w tekście). */
export const PARENTS_TUNE_REACT_ONLY_BLOCKS = new Set([
  "oplaty-naglowek",
  "oplaty-wstep",
  "oplaty-faq",
  "oplaty-tekst-wyzywienie",
  "oplaty-maluch-tekst",
]);

export const PARENTS_TUNE_BLOCKS: { id: string; label: string }[] = [
  { id: "oplaty-naglowek", label: "Nagłówek (h1)" },
  { id: "oplaty-wstep", label: "Akapit pod nagłówkiem" },
  { id: "oplaty-kreska", label: "Miodowa kreska" },
  { id: "oplaty-wyzywienie-eyebrow", label: "Wyżywienie – nadpis" },
  { id: "oplaty-wyzywienie-foto", label: "Wyżywienie – zdjęcie" },
  { id: "oplaty-tekst-wyzywienie", label: "Tekst o wyżywieniu" },
  { id: "oplaty-infografika", label: "Tabelka z misiem" },
  { id: "oplaty-aktywny-rodzic-tytul", label: "Aktywny Rodzic – tytuł" },
  { id: "oplaty-aktywny-rodzic-wstep", label: "Aktywny Rodzic – wstęp" },
  { id: "oplaty-aktywny-rodzic-lista", label: "Aktywny Rodzic – lista" },
  { id: "oplaty-aktywny-rodzic-akapit", label: "Aktywny Rodzic – akapit" },
  { id: "oplaty-maluch-tytul", label: "Aktywny Maluch – tytuł" },
  { id: "oplaty-maluch-tekst", label: "Aktywny Maluch – tekst" },
  { id: "oplaty-faq", label: "FAQ Aktywnie w żłobku" },
  { id: "oplaty-czesne", label: "Ramka: czesne 0 zł" },
];

const emptyDocument = (): ParentsTuneDocument => ({ offsets: {}, text: {} });

function normalizeOffsets(value: unknown): ParentsTuneStore {
  if (!value || typeof value !== "object") return {};
  const store: ParentsTuneStore = {};
  for (const [id, sizes] of Object.entries(value as ParentsTuneStore)) {
    if (!sizes || typeof sizes !== "object") continue;
    const box: Partial<Record<SizeId, TuneOffset>> = {};
    for (const size of ["sm", "md", "lg"] as const) {
      const offset = sizes[size];
      if (!offset || typeof offset !== "object") continue;
      const x = Number((offset as TuneOffset).x);
      const y = Number((offset as TuneOffset).y);
      const width = Number((offset as TuneOffset).width);
      const scale = Number((offset as TuneOffset).scale);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      const entry: TuneOffset = { x, y };
      if (Number.isFinite(width) && width > 0) entry.width = width;
      if (Number.isFinite(scale) && scale > 0 && scale !== 1) entry.scale = scale;
      if (
        entry.x === 0 &&
        entry.y === 0 &&
        entry.width == null &&
        entry.scale == null
      )
        continue;
      box[size] = entry;
    }
    if (Object.keys(box).length > 0) store[id] = box;
  }
  if (store["oplaty-intro"] && !store["oplaty-naglowek"]) {
    store["oplaty-naglowek"] = store["oplaty-intro"];
    delete store["oplaty-intro"];
  }
  if (store["oplaty-programy"] && !store["oplaty-aktywny-rodzic-tytul"]) {
    store["oplaty-aktywny-rodzic-tytul"] = store["oplaty-programy"];
    delete store["oplaty-programy"];
  }
  if (store["oplaty-program-maluch"]) {
    delete store["oplaty-program-maluch"];
  }
  return store;
}

function normalizeText(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  const text: Record<string, string> = {};
  for (const [id, html] of Object.entries(value as Record<string, unknown>)) {
    if (typeof html !== "string") continue;
    const trimmed = html.trim();
    if (trimmed) text[id] = trimmed;
  }
  return text;
}

/** Stary format (same pozycje) albo { offsets, text }. */
export function normalizeParentsTune(value: unknown): ParentsTuneDocument {
  if (!value || typeof value !== "object") return emptyDocument();
  const record = value as Record<string, unknown>;
  if ("offsets" in record || "text" in record) {
    return {
      offsets: normalizeOffsets(record.offsets),
      text: normalizeText(record.text),
    };
  }
  return { offsets: normalizeOffsets(value), text: {} };
}

const bundledDocument = normalizeParentsTune(bundledFile);

/** Tylko plik z repo — bez localStorage (SSR i pierwszy render klienta). */
export function getBundledParentsTune(): ParentsTuneDocument {
  return bundledDocument;
}

export function stripReactOnlyText(
  document: ParentsTuneDocument,
): ParentsTuneDocument {
  const text = { ...document.text };
  for (const id of PARENTS_TUNE_REACT_ONLY_BLOCKS) {
    delete text[id];
  }
  return { ...document, text };
}

export function mergeParentsTune(
  base: ParentsTuneDocument,
  overlay: ParentsTuneDocument,
): ParentsTuneDocument {
  const offsets: ParentsTuneStore = { ...base.offsets };
  for (const [id, sizes] of Object.entries(overlay.offsets)) {
    const prev = { ...(offsets[id] ?? {}) };
    for (const [sizeKey, offset] of Object.entries(sizes)) {
      const size = sizeKey as SizeId;
      if (!offset) continue;
      prev[size] = { ...(prev[size] ?? { x: 0, y: 0 }), ...offset };
    }
    offsets[id] = prev;
  }
  const text = { ...base.text, ...overlay.text };
  for (const id of PARENTS_TUNE_REACT_ONLY_BLOCKS) {
    delete text[id];
  }
  return stripReactOnlyText({ offsets, text });
}

export function loadParentsTune(): ParentsTuneDocument {
  if (typeof window === "undefined") {
    return stripReactOnlyText(bundledDocument);
  }
  let local = emptyDocument();
  try {
    const raw = localStorage.getItem(PARENTS_TUNE_STORAGE_KEY);
    if (raw) local = normalizeParentsTune(JSON.parse(raw));
  } catch {
    local = emptyDocument();
  }
  return stripReactOnlyText(mergeParentsTune(bundledDocument, local));
}

/** Po zapisie w projekcie — jeden stan, bez nakładania starego localStorage. */
export function replaceParentsTuneEverywhere(
  document: ParentsTuneDocument,
): ParentsTuneDocument {
  const clean = stripReactOnlyText(document);
  saveParentsTuneLocal(clean);
  return clean;
}

export function saveParentsTuneLocal(document: ParentsTuneDocument) {
  localStorage.setItem(PARENTS_TUNE_STORAGE_KEY, JSON.stringify(document));
}

export function offsetForBlock(
  document: ParentsTuneDocument,
  id: string,
  width: number,
): TuneOffset {
  const box = document.offsets[id];
  if (!box) return { x: 0, y: 0 };
  const size = sizeForWidth(width);
  return box[size] ?? { x: 0, y: 0 };
}

export function setBlockOffset(
  document: ParentsTuneDocument,
  id: string,
  size: SizeId,
  offset: TuneOffset,
): ParentsTuneDocument {
  const nextBox = { ...(document.offsets[id] ?? {}) };
  const clean = { ...offset };
  if (clean.width != null && clean.width <= 0) delete clean.width;
  if (clean.scale != null && (clean.scale <= 0 || clean.scale === 1)) {
    delete clean.scale;
  }
  if (
    clean.x === 0 &&
    clean.y === 0 &&
    clean.width == null &&
    clean.scale == null
  )
    delete nextBox[size];
  else nextBox[size] = clean;
  const offsets = { ...document.offsets };
  if (Object.keys(nextBox).length === 0) delete offsets[id];
  else offsets[id] = nextBox;
  return { ...document, offsets };
}

export function setBlockText(
  document: ParentsTuneDocument,
  id: string,
  html: string,
): ParentsTuneDocument {
  if (PARENTS_TUNE_REACT_ONLY_BLOCKS.has(id)) return document;
  const trimmed = html.trim();
  const text = { ...document.text };
  if (!trimmed) delete text[id];
  else text[id] = trimmed;
  return { ...document, text };
}

export function nudgeStore(
  document: ParentsTuneDocument,
  id: string,
  size: SizeId,
  dx: number,
  dy: number,
): ParentsTuneDocument {
  const current = document.offsets[id]?.[size] ?? { x: 0, y: 0 };
  return setBlockOffset(document, id, size, {
    ...current,
    x: current.x + dx,
    y: current.y + dy,
  });
}

export function nudgeWidth(
  document: ParentsTuneDocument,
  id: string,
  size: SizeId,
  delta: number,
  fallbackWidth: number,
): ParentsTuneDocument {
  const current = document.offsets[id]?.[size] ?? { x: 0, y: 0 };
  const base = current.width ?? fallbackWidth;
  const nextWidth = Math.max(120, Math.round(base + delta));
  return setBlockOffset(document, id, size, {
    ...current,
    width: nextWidth,
  });
}

export function nudgeScale(
  document: ParentsTuneDocument,
  id: string,
  size: SizeId,
  delta: number,
): ParentsTuneDocument {
  const current = document.offsets[id]?.[size] ?? { x: 0, y: 0 };
  const base = current.scale ?? 1;
  const nextScale = Math.min(2.5, Math.max(0.5, Math.round((base + delta) * 100) / 100));
  return setBlockOffset(document, id, size, {
    ...current,
    scale: nextScale,
  });
}

export function resetBlockOffset(
  document: ParentsTuneDocument,
  id: string,
  size?: SizeId,
): ParentsTuneDocument {
  if (!document.offsets[id]) return document;
  if (!size) {
    const offsets = { ...document.offsets };
    delete offsets[id];
    return { ...document, offsets };
  }
  const box = { ...document.offsets[id] };
  delete box[size];
  const offsets = { ...document.offsets };
  if (Object.keys(box).length === 0) delete offsets[id];
  else offsets[id] = box;
  return { ...document, offsets };
}

export function resetBlockText(
  document: ParentsTuneDocument,
  id: string,
): ParentsTuneDocument {
  if (!document.text[id]) return document;
  const text = { ...document.text };
  delete text[id];
  return { ...document, text };
}

export function resetAll(document: ParentsTuneDocument): ParentsTuneDocument {
  return emptyDocument();
}
