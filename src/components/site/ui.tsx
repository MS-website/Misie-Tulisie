import { Link } from "@tanstack/react-router";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e?.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn("reveal", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function RevealStaggerList({
  className,
  stagger = 480,
  innerStagger = 560,
  motion = "up",
  whenVisible = "list",
  children,
}: {
  className?: string;
  /** Opóźnienie między kolejnymi elementami listy (ms). */
  stagger?: number;
  /** Przy `text-then-arrow`: opóźnienie strzałki względem tekstu w wierszu (ms). */
  innerStagger?: number;
  motion?: "up" | "text-then-arrow";
  /** `arrived` — sekwencja startuje dopiero, gdy lista dojedzie w pole widzenia. */
  whenVisible?: "list" | "arrived";
  children: ReactNode;
}) {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (whenVisible === "arrived") {
      const start = () => {
        if (el.getBoundingClientRect().top > window.innerHeight * 0.72) return;
        el.classList.add("is-visible");
        window.removeEventListener("scroll", start);
        window.removeEventListener("resize", start);
      };
      start();
      window.addEventListener("scroll", start, { passive: true });
      window.addEventListener("resize", start);
      return () => {
        window.removeEventListener("scroll", start);
        window.removeEventListener("resize", start);
      };
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [whenVisible]);
  return (
    <ul
      ref={ref}
      className={cn(
        "reveal-stagger",
        whenVisible === "arrived" && "reveal-stagger-arrived",
        motion === "text-then-arrow" && "reveal-stagger-text-then-arrow",
        className,
      )}
      style={
        {
          "--reveal-stagger": `${stagger}ms`,
          "--reveal-stagger-inner": `${innerStagger}ms`,
        } as CSSProperties
      }
    >
      {children}
    </ul>
  );
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 h-12 text-sm font-medium tracking-wide transition-all duration-500 ease-[var(--ease-calm)] hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const variants = {
  primary: "bg-primary text-primary-foreground hover:bg-honey",
  ghost: "border border-foreground/20 text-foreground hover:border-foreground/60 hover:bg-card",
  text: "px-0 h-auto rounded-none text-foreground link-underline hover:translate-y-0",
};

type BtnProps = {
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
};

export function ButtonLink({
  to,
  hash,
  children,
  variant = "primary",
  className,
}: BtnProps & { to: string; hash?: string }) {
  return (
    <Link
      to={to}
      resetScroll={!hash}
      {...(hash ? { hash } : {})}
      className={cn(base, variants[variant], className)}
    >
      {children}
    </Link>
  );
}

export function ButtonA({
  href,
  children,
  variant = "primary",
  className,
  download,
}: BtnProps & { href: string; download?: string }) {
  return (
    <a
      href={href}
      {...(download ? { download } : {})}
      className={cn(base, variants[variant], className)}
    >
      {children}
    </a>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow mb-6">{children}</p>;
}

export function PageIntro({
  eyebrow,
  title,
  lead,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: string;
  className?: string;
}) {
  return (
    <section className={cn("container-site pt-40 pb-16 md:pt-52 md:pb-24", className)}>
      <Reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="font-display max-w-4xl text-5xl md:text-7xl lg:text-8xl">{title}</h1>
        {lead && (
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">{lead}</p>
        )}
      </Reveal>
    </section>
  );
}

export function Photo({
  src,
  alt,
  className,
  eager,
  zoomOut,
  fit = "cover",
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
  zoomOut?: boolean;
  fit?: "cover" | "contain";
}) {
  return (
    <div
      className={cn(
        "rounded-md",
        fit === "contain" ? "bg-transparent" : "bg-sand",
        zoomOut ? "gallery-frame" : "overflow-hidden",
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding={eager ? "sync" : "async"}
        className={cn(
          "h-full w-full",
          fit === "contain" ? "object-contain object-left" : "object-cover",
        )}
      />
    </div>
  );
}
