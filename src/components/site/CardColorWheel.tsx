import {
  useCallback,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { CardFill } from "@/lib/uklad-data";
import { cardFillCss } from "@/lib/uklad-data";

const SIZE = 192;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = SIZE / 2 - 2;
const INNER_R = OUTER_R - 22;
function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function dist(x: number, y: number) {
  return Math.hypot(x - CX, y - CY);
}

function hueFromPoint(x: number, y: number) {
  const angle = Math.atan2(y - CY, x - CX);
  return (angle * (180 / Math.PI) + 360) % 360;
}

function lcFromPoint(x: number, y: number): Pick<CardFill, "l" | "c"> {
  const nx = clamp((x - CX) / INNER_R, -1, 1);
  const ny = clamp((y - CY) / INNER_R, -1, 1);
  const c = ((nx + 1) / 2) * 0.16;
  const l = 1 - ((ny + 1) / 2) * (1 - 0.58);
  return { l: clamp(l, 0.58, 0.98), c: clamp(c, 0, 0.16) };
}

function hueKnob(h: number) {
  const rad = (h * Math.PI) / 180;
  const r = (OUTER_R + INNER_R) / 2;
  return { x: CX + Math.cos(rad) * r, y: CY + Math.sin(rad) * r };
}

function lcKnob(l: number, c: number) {
  const nx = c / 0.16;
  const ny = 1 - (l - 0.58) / (0.98 - 0.58);
  return {
    x: CX + (nx * 2 - 1) * INNER_R * 0.92,
    y: CY + (ny * 2 - 1) * INNER_R * 0.92,
  };
}

type Props = {
  title: string;
  value: CardFill;
  onChange: (fill: CardFill) => void;
};

export function CardColorWheel({ title, value, onChange }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<"hue" | "lc" | null>(null);

  const pick = useCallback(
    (clientX: number, clientY: number) => {
      const root = rootRef.current;
      if (!root || !modeRef.current) return;
      const rect = root.getBoundingClientRect();
      const scale = SIZE / rect.width;
      const x = (clientX - rect.left) * scale;
      const y = (clientY - rect.top) * scale;
      if (modeRef.current === "hue") {
        onChange({ ...value, h: hueFromPoint(x, y) });
        return;
      }
      onChange({ ...value, ...lcFromPoint(x, y) });
    },
    [onChange, value],
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const scale = SIZE / rect.width;
    const x = (event.clientX - rect.left) * scale;
    const y = (event.clientY - rect.top) * scale;
    const d = dist(x, y);
    if (d >= INNER_R - 4 && d <= OUTER_R + 4) modeRef.current = "hue";
    else if (d < INNER_R - 6) modeRef.current = "lc";
    else return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pick(event.clientX, event.clientY);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!modeRef.current) return;
    pick(event.clientX, event.clientY);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    modeRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const hk = hueKnob(value.h);
  const lk = lcKnob(value.l, value.c);
  const innerBg = `linear-gradient(to top, oklch(0.58 ${value.c} ${value.h}), oklch(0.98 ${value.c} ${value.h})), linear-gradient(to right, oklch(${value.l} 0 ${value.h}), oklch(${value.l} 0.16 ${value.h}))`;

  return (
    <div className="mt-4">
      <p className="text-xs text-muted-foreground">{title}</p>
      <div
        ref={rootRef}
        className="relative mx-auto mt-3 aspect-square w-full max-w-[12rem] touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, oklch(0.72 0.17 25), oklch(0.72 0.17 55), oklch(0.72 0.17 95), oklch(0.72 0.17 145), oklch(0.72 0.17 195), oklch(0.72 0.17 245), oklch(0.72 0.17 295), oklch(0.72 0.17 355), oklch(0.72 0.17 25))",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute rounded-full border border-border/40"
          style={{
            left: `${((CX - INNER_R) / SIZE) * 100}%`,
            top: `${((CY - INNER_R) / SIZE) * 100}%`,
            width: `${((INNER_R * 2) / SIZE) * 100}%`,
            height: `${((INNER_R * 2) / SIZE) * 100}%`,
            background: innerBg,
            backgroundBlendMode: "multiply, normal",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
          style={{
            left: `${(hk.x / SIZE) * 100}%`,
            top: `${(hk.y / SIZE) * 100}%`,
            background: `oklch(0.72 0.17 ${value.h})`,
          }}
        />
        <div
          className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
          style={{
            left: `${(lk.x / SIZE) * 100}%`,
            top: `${(lk.y / SIZE) * 100}%`,
            background: cardFillCss({ ...value, alpha: 100 }),
          }}
        />
      </div>
      <p className="mt-2 text-center text-[0.65rem] leading-relaxed text-muted-foreground">
        Pierścień — odcień. Środek — nasycenie i jasność.
      </p>
      <label className="mt-3 block">
        <span className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
          <span>Krycie na stronie</span>
          <span className="tabular-nums text-foreground">{value.alpha}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value.alpha}
          onChange={(event) =>
            onChange({ ...value, alpha: Number(event.target.value) })
          }
          className="mt-1.5 h-2 w-full cursor-pointer accent-primary"
        />
      </label>
      <div
        className="mt-3 h-10 w-full rounded-md border border-border/60"
        style={{ backgroundColor: cardFillCss(value) }}
        aria-hidden="true"
      />
    </div>
  );
}
