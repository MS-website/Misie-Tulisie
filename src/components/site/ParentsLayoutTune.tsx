import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { SIZE_META, sizeForWidth, type SizeId } from "@/lib/uklad-data";
import { UKLAD_MANUAL_EDITOR_ENABLED } from "@/lib/uklad-editor-enabled";
import {
  getBundledParentsTune,
  loadParentsTune,
  nudgeStore,
  nudgeWidth,
  offsetForBlock,
  replaceParentsTuneEverywhere,
  PARENTS_TUNE_BLOCKS,
  PARENTS_TUNE_REACT_ONLY_BLOCKS,
  resetAll,
  resetBlockOffset,
  resetBlockText,
  saveParentsTuneLocal,
  stripReactOnlyText,
  setBlockOffset,
  setBlockText,
  type ParentsTuneDocument,
} from "@/lib/parents-layout-tune";
import { cn } from "@/lib/utils";

type TuneMode = "move" | "text";

type TuneContextValue = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  mode: TuneMode;
  setMode: (mode: TuneMode) => void;
  document: ParentsTuneDocument;
  size: SizeId;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  nudge: (dx: number, dy: number) => void;
  nudgeBlockWidth: (delta: number) => void;
  nudgeBlockScale: (delta: number) => void;
  setOffset: (id: string, offset: { x: number; y: number }) => void;
  saveText: (id: string, html: string) => void;
  resetSelectedOffset: () => void;
  resetSelectedText: () => void;
  resetEverything: () => void;
  saveToProject: () => Promise<string>;
  copyJson: () => Promise<void>;
};

const ParentsTuneContext = createContext<TuneContextValue | null>(null);

function useViewportSize(): SizeId {
  const [size, setSize] = useState<SizeId>(() =>
    typeof window === "undefined" ? "lg" : sizeForWidth(window.innerWidth),
  );
  useEffect(() => {
    const update = () => setSize(sizeForWidth(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

export function ParentsTuneSurface({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  if (UKLAD_MANUAL_EDITOR_ENABLED) {
    return className ? <div className={className}>{children}</div> : children;
  }
  const tune = useContext(ParentsTuneContext);
  const [fallback, setFallback] = useState(() => getBundledParentsTune());
  useEffect(() => {
    setFallback(loadParentsTune());
  }, []);
  const [width, setWidth] = useState(
    () => (typeof window !== "undefined" ? window.innerWidth : 1280),
  );
  const innerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
  } | null>(null);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const document = tune?.document ?? fallback;
  const selectedId = tune?.selectedId ?? null;
  const setSelectedId = tune?.setSelectedId ?? (() => {});
  const enabled = tune?.enabled ?? false;
  const mode = tune?.mode ?? "move";
  const saveText = tune?.saveText;
  const setOffset = tune?.setOffset;
  const selected = selectedId === id;
  const label = PARENTS_TUNE_BLOCKS.find((b) => b.id === id)?.label ?? id;
  const offset = offsetForBlock(document, id, width);
  const storedHtml = PARENTS_TUNE_REACT_ONLY_BLOCKS.has(id)
    ? undefined
    : document.text[id]?.trim();
  const savedHtml = storedHtml || undefined;
  const textActive =
    enabled && mode === "text" && selected && !PARENTS_TUNE_REACT_ONLY_BLOCKS.has(id);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el || !savedHtml) return;
    if (el.innerHTML !== savedHtml) el.innerHTML = savedHtml;
  }, [savedHtml, id]);

  useEffect(() => {
    const el = innerRef.current;
    if (!el || !textActive) {
      if (el) el.contentEditable = "false";
      return;
    }
    el.contentEditable = "true";
    const onInput = () => saveText?.(id, el.innerHTML);
    el.addEventListener("input", onInput);
    return () => {
      el.contentEditable = "false";
      el.removeEventListener("input", onInput);
    };
  }, [textActive, id, saveText]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled || mode !== "move") return;
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("a, button, input, textarea, select, label")) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedId(id);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseX: offset.x,
      baseY: offset.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    setOffset?.(id, { x: drag.baseX + dx, y: drag.baseY + dy });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div
      data-parents-tune={id}
      {...(PARENTS_TUNE_REACT_ONLY_BLOCKS.has(id)
        ? { "data-uklad-skip-text": "" }
        : {})}
      className={cn(
        className,
        enabled && "relative z-[1] block w-full max-w-none transition-[box-shadow]",
        enabled && selected && "z-[2] ring-2 ring-honey ring-offset-2",
        enabled && !selected && "hover:ring-1 hover:ring-honey/50",
        enabled && mode === "move" && "cursor-grab active:cursor-grabbing",
        textActive && "cursor-text",
      )}
      style={(() => {
        const style: CSSProperties = {};
        if (offset.x || offset.y) {
          style.transform = `translate(${offset.x}px, ${offset.y}px)`;
        }
        if (offset.width) {
          style.width = offset.width;
          style.maxWidth = "none";
        }
        return Object.keys(style).length > 0 ? style : undefined;
      })()}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={
        enabled
          ? (event) => {
              event.stopPropagation();
              setSelectedId(id);
            }
          : undefined
      }
      title={enabled ? label : undefined}
    >
      <div
        ref={innerRef}
        className={cn(
          enabled && "block w-full max-w-none [&_*]:max-w-none",
          textActive &&
            "rounded-sm outline outline-2 outline-offset-4 outline-honey/70",
        )}
        style={
          offset.scale != null && offset.scale !== 1
            ? {
                transform: `scale(${offset.scale})`,
                transformOrigin: "top left",
              }
            : undefined
        }
        suppressContentEditableWarning
      >
        {savedHtml ? null : children}
      </div>
    </div>
  );
}

function TunePanel() {
  const tune = useContext(ParentsTuneContext);
  if (!tune || !tune.enabled) return null;

  const {
    document,
    size,
    mode,
    setMode,
    selectedId,
    setSelectedId,
    nudge,
    nudgeBlockWidth,
    nudgeBlockScale,
    resetSelectedOffset,
    resetSelectedText,
    resetEverything,
    saveToProject,
    copyJson,
    setEnabled,
  } = tune;

  const selected =
    PARENTS_TUNE_BLOCKS.find((b) => b.id === selectedId) ?? PARENTS_TUNE_BLOCKS[0];
  const offset = document.offsets[selected.id]?.[size] ?? { x: 0, y: 0 };
  const hasText = Boolean(document.text[selected.id]);
  const [status, setStatus] = useState("");

  const step = (dx: number, dy: number) => {
    setStatus("");
    nudge(dx, dy);
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-[200] max-h-[min(32rem,calc(100vh-2rem))] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-md border border-border bg-background/95 p-4 text-sm shadow-lg backdrop-blur"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground">Układ: Dla rodziców</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Widok: {SIZE_META[size].label} ({SIZE_META[size].width}px)
          </p>
        </div>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setEnabled(false)}
        >
          Zamknij
        </button>
      </div>

      <div className="mt-3 flex gap-1 rounded border border-border p-1">
        <button
          type="button"
          className={cn(
            "flex-1 rounded px-2 py-1 text-xs",
            mode === "move" ? "bg-honey text-white" : "hover:bg-muted",
          )}
          onClick={() => setMode("move")}
        >
          Przesuń
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 rounded px-2 py-1 text-xs",
            mode === "text" ? "bg-honey text-white" : "hover:bg-muted",
          )}
          onClick={() => setMode("text")}
        >
          Tekst
        </button>
      </div>

      <label className="mt-3 block text-xs text-muted-foreground">
        Sekcja
        <select
          className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground"
          value={selected.id}
          onChange={(event) => setSelectedId(event.target.value)}
        >
          {PARENTS_TUNE_BLOCKS.map((block) => (
            <option key={block.id} value={block.id}>
              {block.label}
            </option>
          ))}
        </select>
      </label>

      <p className="mt-2 text-xs text-muted-foreground">
        {mode === "move" ? "Przeciągnij blok albo użyj strzałek. " : null}
        <span className="font-medium text-foreground">
          X {offset.x}px, Y {offset.y}px
          {offset.width ? `, szer. ${offset.width}px` : ""}
          {offset.scale && offset.scale !== 1 ? `, skala ${offset.scale}` : ""}
        </span>
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">Szerokość (więcej w linii)</span>
        <div className="flex gap-1">
          <button
            type="button"
            className="rounded border border-border px-2 py-1 text-xs hover:bg-muted"
            title="−48 px"
            onClick={() => {
              setStatus("");
              nudgeBlockWidth(-48);
            }}
          >
            −−
          </button>
          <button
            type="button"
            className="rounded border border-border px-2 py-1 text-xs hover:bg-muted"
            onClick={() => {
              setStatus("");
              nudgeBlockWidth(-16);
            }}
          >
            −
          </button>
          <button
            type="button"
            className="rounded border border-border px-2 py-1 text-xs hover:bg-muted"
            onClick={() => {
              setStatus("");
              nudgeBlockWidth(16);
            }}
          >
            +
          </button>
          <button
            type="button"
            className="rounded border border-border px-2 py-1 text-xs hover:bg-muted"
            title="+48 px"
            onClick={() => {
              setStatus("");
              nudgeBlockWidth(48);
            }}
          >
            ++
          </button>
        </div>
      </div>
      {PARENTS_TUNE_IMAGE_BLOCKS.has(selected.id) ? (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">Powiększenie zdjęcia</span>
          <div className="flex gap-1">
            <button
              type="button"
              className="rounded border border-border px-2 py-1 text-xs hover:bg-muted"
              onClick={() => {
                setStatus("");
                nudgeBlockScale(-0.05);
              }}
            >
              −
            </button>
            <button
              type="button"
              className="rounded border border-border px-2 py-1 text-xs hover:bg-muted"
              onClick={() => {
                setStatus("");
                nudgeBlockScale(0.05);
              }}
            >
              +
            </button>
          </div>
        </div>
      ) : null}

      {mode === "move" ? (
        <>
          <div className="mt-3 grid grid-cols-3 gap-1">
            <span />
            <button
              type="button"
              className="rounded border border-border px-2 py-1 hover:bg-muted"
              onClick={() => step(0, -4)}
            >
              ↑
            </button>
            <span />
            <button
              type="button"
              className="rounded border border-border px-2 py-1 hover:bg-muted"
              onClick={() => step(-4, 0)}
            >
              ←
            </button>
            <button
              type="button"
              className="rounded border border-border px-2 py-1 text-xs hover:bg-muted"
              onClick={() => resetSelectedOffset()}
            >
              0
            </button>
            <button
              type="button"
              className="rounded border border-border px-2 py-1 hover:bg-muted"
              onClick={() => step(4, 0)}
            >
              →
            </button>
            <span />
            <button
              type="button"
              className="rounded border border-border px-2 py-1 hover:bg-muted"
              onClick={() => step(0, 4)}
            >
              ↓
            </button>
            <span />
          </div>
        </>
      ) : PARENTS_TUNE_REACT_ONLY_BLOCKS.has(selected.id) ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Tu tylko przesuwasz ramkę i szerokość (++, −−). Nie używaj trybu Tekst —
          łamanie linii ustawiasz szerokością, nie spacjami.
        </p>
      ) : PARENTS_TUNE_REACT_ONLY_BLOCKS.has(selected.id) ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Tu tylko przesuwasz ramkę i szerokość (++, −−). Nie używaj trybu Tekst —
          łamanie linii ustawiasz szerokością, nie spacjami.
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          Kliknij sekcję i edytuj tekst. Szerokość ustawiasz przyciskami ++ powyżej
          (działa też w tym trybie). Zmiany zapisują się automatycznie.
          {hasText ? (
            <span className="mt-1 block font-medium text-foreground">
              Ta sekcja ma zapisany tekst w projekcie.
            </span>
          ) : null}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded border border-border px-2 py-1 text-xs hover:bg-muted"
          onClick={() => resetSelectedOffset()}
        >
          Reset pozycji
        </button>
        <button
          type="button"
          className="rounded border border-border px-2 py-1 text-xs hover:bg-muted"
          onClick={() => resetSelectedText()}
        >
          Reset tekstu
        </button>
        <button
          type="button"
          className="rounded border border-border px-2 py-1 text-xs hover:bg-muted"
          onClick={() => resetEverything()}
        >
          Reset wszystko
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded bg-honey px-2 py-1 text-xs font-medium text-white hover:bg-honey/90"
          onClick={async () => {
            try {
              await saveToProject();
              setStatus("Zapisano — odświeżam stronę, żeby układ = podgląd.");
              window.setTimeout(() => window.location.reload(), 400);
            } catch {
              setStatus("Nie udało się zapisać (dev server?)");
            }
          }}
        >
          Zapisz w projekcie
        </button>
        <button
          type="button"
          className="rounded border border-border px-2 py-1 text-xs hover:bg-muted"
          onClick={async () => {
            await copyJson();
            setStatus("Skopiowano JSON do schowka");
          }}
        >
          Kopiuj JSON
        </button>
      </div>

      {status ? (
        <p className="mt-2 text-xs text-muted-foreground">{status}</p>
      ) : null}
    </div>
  );
}

export function ParentsLayoutTuneRoot({ children }: { children: ReactNode }) {
  if (UKLAD_MANUAL_EDITOR_ENABLED || !import.meta.env.DEV) return children;
  return <ParentsLayoutTuneInner>{children}</ParentsLayoutTuneInner>;
}

function ParentsLayoutTuneInner({ children }: { children: ReactNode }) {
  const size = useViewportSize();
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).has("uklad-rodzicow");
  });
  const [mode, setMode] = useState<TuneMode>("move");
  const [document, setDocument] = useState<ParentsTuneDocument>(() =>
    getBundledParentsTune(),
  );
  useEffect(() => {
    setDocument(loadParentsTune());
  }, []);
  const [selectedId, setSelectedId] = useState<string | null>(
    PARENTS_TUNE_BLOCKS[0]?.id ?? null,
  );

  useEffect(() => {
    saveParentsTuneLocal(stripReactOnlyText(document));
  }, [document]);

  const nudge = useCallback(
    (dx: number, dy: number) => {
      const id = selectedId ?? PARENTS_TUNE_BLOCKS[0]?.id;
      if (!id) return;
      setDocument((current) => nudgeStore(current, id, size, dx, dy));
    },
    [selectedId, size],
  );

  const setOffset = useCallback(
    (id: string, offset: { x: number; y: number }) => {
      setDocument((current) => {
        const currentBox = current.offsets[id]?.[size] ?? { x: 0, y: 0 };
        return setBlockOffset(current, id, size, { ...currentBox, ...offset });
      });
    },
    [size],
  );

  const nudgeBlockWidth = useCallback(
    (delta: number) => {
      const id = selectedId ?? PARENTS_TUNE_BLOCKS[0]?.id;
      if (!id) return;
      const el = window.document.querySelector(`[data-parents-tune="${id}"]`);
      const measured =
        el instanceof HTMLElement ? el.getBoundingClientRect().width : 480;
      setDocument((current) =>
        nudgeWidth(current, id, size, delta, measured),
      );
    },
    [selectedId, size],
  );

  const nudgeBlockScale = useCallback(
    (delta: number) => {
      const id = selectedId ?? PARENTS_TUNE_BLOCKS[0]?.id;
      if (!id || !PARENTS_TUNE_IMAGE_BLOCKS.has(id)) return;
      setDocument((current) => nudgeScale(current, id, size, delta));
    },
    [selectedId, size],
  );

  const saveText = useCallback((id: string, html: string) => {
    setDocument((current) => setBlockText(current, id, html));
  }, []);

  const resetSelectedOffset = useCallback(() => {
    const id = selectedId ?? PARENTS_TUNE_BLOCKS[0]?.id;
    if (!id) return;
    setDocument((current) => resetBlockOffset(current, id, size));
  }, [selectedId, size]);

  const resetSelectedText = useCallback(() => {
    const id = selectedId ?? PARENTS_TUNE_BLOCKS[0]?.id;
    if (!id) return;
    setDocument((current) => resetBlockText(current, id));
    const el = window.document.querySelector(
      `[data-parents-tune="${id}"] [contenteditable]`,
    );
    if (el) window.location.reload();
  }, [selectedId]);

  const resetEverything = useCallback(() => {
    setDocument(resetAll());
    localStorage.removeItem("misie-parents-tune-v1");
    localStorage.removeItem("misie-parents-tune-v2");
    localStorage.removeItem("misie-parents-tune-v3");
    localStorage.removeItem("misie-parents-tune-v2");
    localStorage.removeItem("misie-parents-tune-v3");
    window.location.reload();
  }, []);

  const saveToProject = useCallback(async () => {
    const payload = stripReactOnlyText(document);
    const response = await fetch("/__parents-tune", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("save failed");
    replaceParentsTuneEverywhere(payload);
    setDocument(payload);
    return "ok";
  }, [document]);

  const copyJson = useCallback(async () => {
    await navigator.clipboard.writeText(
      JSON.stringify(stripReactOnlyText(document), null, 2),
    );
  }, [document]);

  const value = useMemo<TuneContextValue>(
    () => ({
      enabled,
      setEnabled,
      mode,
      setMode,
      document,
      size,
      selectedId,
      setSelectedId,
      nudge,
      nudgeBlockWidth,
      nudgeBlockScale,
      setOffset,
      saveText,
      resetSelectedOffset,
      resetSelectedText,
      resetEverything,
      saveToProject,
      copyJson,
    }),
    [
      enabled,
      mode,
      document,
      size,
      selectedId,
      nudge,
      nudgeBlockWidth,
      nudgeBlockScale,
      setOffset,
      saveText,
      resetSelectedOffset,
      resetSelectedText,
      resetEverything,
      saveToProject,
      copyJson,
    ],
  );

  useEffect(() => {
    if (!enabled) return;
    const prev = window.document.body.style.userSelect;
    window.document.body.style.userSelect = mode === "move" ? "none" : "";
    return () => {
      window.document.body.style.userSelect = prev;
    };
  }, [enabled, mode]);

  return (
    <ParentsTuneContext.Provider value={value}>
      {children}
      {!enabled ? (
        <button
          type="button"
          className="fixed bottom-4 right-4 z-[199] rounded-full border border-border bg-background px-4 py-2 text-sm font-medium shadow-md hover:bg-muted"
          onClick={() => setEnabled(true)}
        >
          Układ i tekst
        </button>
      ) : (
        <TunePanel />
      )}
    </ParentsTuneContext.Provider>
  );
}
