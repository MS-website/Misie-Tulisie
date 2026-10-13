import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/misie-logo.png";
import { contact, nav } from "@/lib/site";
import { ButtonLink } from "./ui";
import { cn } from "@/lib/utils";

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <Link
      to="/"
      className="flex items-center gap-3"
      aria-label="Misie Tulisie — strona główna"
    >
      <img
        src={logo}
        alt="Logo Misie Tulisie"
        className={size === "lg" ? "h-16 w-auto" : "h-11 w-auto"}
      />
      <span className="font-display text-2xl leading-none">Misie Tulisie</span>
    </Link>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const showVisitButton = useRouterState({
    select: (state) => state.location.pathname !== "/formularz-rekrutacyjny",
  });

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-700",
        scrolled || open
          ? "border-b border-border/70 bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-site flex h-20 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-5 xl:gap-8 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="link-underline text-sm text-foreground/80 hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div
          className={cn("hidden lg:block", !showVisitButton && "invisible")}
          inert={!showVisitButton}
        >
          <ButtonLink to="/kontakt" className="h-11">
            Umów wizytę
          </ButtonLink>
        </div>
        <button
          className="relative h-10 w-10 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={open}
        >
          <span
            className={cn(
              "absolute left-2 right-2 h-px bg-foreground transition-all duration-500",
              open ? "top-1/2 rotate-45" : "top-[15px]",
            )}
          />
          <span
            className={cn(
              "absolute left-2 right-2 h-px bg-foreground transition-all duration-500",
              open ? "top-1/2 -rotate-45" : "top-[25px]",
            )}
          />
        </button>
      </div>

      <div
        className={cn(
          "fixed inset-x-0 top-20 bottom-0 bg-background transition-all duration-700 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <div className="container-site flex h-full flex-col justify-between pb-10 pt-8">
          <nav className="flex flex-col">
            {nav.map((n, i) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="font-display border-b border-border py-4 text-4xl transition-all duration-700"
                style={{
                  transitionDelay: open ? `${80 + i * 50}ms` : "0ms",
                  transform: open ? "none" : "translateY(12px)",
                  opacity: open ? 1 : 0,
                }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="space-y-4">
            {showVisitButton && (
              <div onClick={() => setOpen(false)}>
                <ButtonLink to="/kontakt" className="w-full">
                  Umów wizytę
                </ButtonLink>
              </div>
            )}
            <a
              href={contact.phoneHref}
              className="block text-center text-sm text-muted-foreground"
            >
              {contact.phone}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
