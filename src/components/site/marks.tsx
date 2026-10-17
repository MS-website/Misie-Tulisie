import type { ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

type MarkProps = SVGProps<SVGSVGElement>;

export function AppleMark(props: MarkProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...line} {...props}>
      <path d="M34 13.5c.6-4.4 3.4-7.6 7.4-8.2" />
      <path d="M34.4 14.2c4.4-1.2 9 1.4 10 5.6-4.4 1.2-8-.6-10-5.6z" />
      <path d="M32 18.5c-10 .4-17.5 8.6-17.5 18.4C14.5 49.2 22.2 57 32 57s17.5-7.8 17.5-20.1C49.5 27.1 42 18.9 32 18.5z" />
      <path d="M32 19c.5 3.4.3 6.4 0 9" />
    </svg>
  );
}

export function BlocksMark(props: MarkProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...line} {...props}>
      <rect x="22" y="6" width="20" height="20" rx="3.5" />
      <rect x="8" y="32" width="20" height="20" rx="3.5" />
      <rect x="36" y="32" width="20" height="20" rx="3.5" />
      <text
        x="32"
        y="17"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="currentColor"
        stroke="none"
        fontSize="10"
        fontFamily="inherit"
      >
        A
      </text>
      <text
        x="18"
        y="43"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="currentColor"
        stroke="none"
        fontSize="10"
        fontFamily="inherit"
      >
        B
      </text>
      <text
        x="46"
        y="43"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="currentColor"
        stroke="none"
        fontSize="10"
        fontFamily="inherit"
      >
        C
      </text>
    </svg>
  );
}

export function HouseMark(props: MarkProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...line} {...props}>
      <path d="M12 30.5 32 14l20 16.5" />
      <path d="M18 28v22h28V28" />
      <path d="M28 50V38h8v12" />
      <circle cx="32" cy="33" r="2.2" />
    </svg>
  );
}

export function HeartMark(props: MarkProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...line} {...props}>
      <path d="M32 52C20 43.2 12 36.2 12 27.2 12 21.2 16.6 17 22.2 17c3.2 0 6 1.5 9.8 4.8C35.8 18.5 38.6 17 41.8 17 47.4 17 52 21.2 52 27.2 52 36.2 44 43.2 32 52z" />
    </svg>
  );
}

export function BranchMark(props: MarkProps) {
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true" {...line} {...props}>
      <path d="M18 66c10-12 12-24 22-34 8-8 18-10 26-8" />
      <path d="M34 48c6-7 16-7 18-1-6 4-13 4-18 1z" />
      <path d="M48 34c7-6 16-4 17 3-7 3-13 2-17-3z" />
      <path d="M26 58c-6-6-4-14 3-16 3 6 2 12-3 16z" />
    </svg>
  );
}

export function RainbowMark(props: MarkProps) {
  return (
    <svg viewBox="0 0 80 72" aria-hidden="true" {...line} {...props}>
      <path d="M8 46a32 32 0 0 1 64 0" />
      <path d="M18 46a22 22 0 0 1 44 0" />
      <path d="M28 46a12 12 0 0 1 24 0" />
      <path d="M40 60s-4.2-2.6-4.2-5.2a2.4 2.4 0 0 1 4.2-1.2 2.4 2.4 0 0 1 4.2 1.2C44.2 57.4 40 60 40 60z" />
    </svg>
  );
}

export function MarkBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-[4.5rem] items-center justify-center overflow-hidden rounded-full bg-sand text-honey",
        className,
      )}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
