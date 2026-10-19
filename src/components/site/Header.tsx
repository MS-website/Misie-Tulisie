import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/misie-logo.png";
import { contact, nav } from "@/lib/site";
import { ButtonLink } from "./ui";
import { cn } from "@/lib/utils";

/** Czas, przez który kremowe tło zostaje nad treścią po wyborze zakładki (mobile). */
const MOBILE_MENU_CLOSE_MS = 400;

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <Link
      to="/"
      resetScroll
      className="flex items-center gap-3"
      aria-label="Misie Tulisie — strona główna"
    >
      <img
        src={logo}
        alt="Logo Misie Tulisie"
        className={size === "lg" ? "h-20 w-auto md:h-[5.5rem]" : "h-14 w-auto"}
      />
      <span className="font-display text-[1.75rem] leading-none md:text-[1.875rem]">
        Misie Tulisie
      </span>
    </Link>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileCover, setMobileCover] = useState(false);
  const closeCoverTimer = useRef(0);
  const showMobileMenu = open || mobileCover;
  const showVisitButton = useRouterState({
    select: (state) => {
      const path = state.location.pathname;
      return path !== "/formularz-rekrutacyjny" && path !== "/kontakt";
    },
  });

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showMobileMenu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMobileMenu]);

  useEffect(() => () => window.clearTimeout(closeCoverTimer.current), []);

  const closeMobileMenu = () => {
    if (!open) return;
    setOpen(false);
    setMobileCover(true);
    window.clearTimeout(closeCoverTimer.current);
    closeCoverTimer.current = window.setTimeout(() => {
      setMobileCover(false);
    }, MOBILE_MENU_CLOSE_MS);
  };

  const toggleMobileMenu = () => {
    if (open) {
      closeMobileMenu();
      return;
    }
    window.clearTimeout(closeCoverTimer.current);
    setMobileCover(false);
    setOpen(true);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-700",
        scrolled || showMobileMenu
          ? cn(
              "border-b border-border/70",
              showMobileMenu
                ? "max-lg:bg-background max-lg:backdrop-blur-none max-lg:transition-[border-color]"
                : "max-lg:bg-background/85 max-lg:backdrop-blur-xl",
              "lg:bg-background/85 lg:backdrop-blur-xl",
            )
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-site grid h-20 grid-cols-[minmax(0,1fr)_auto] items-center lg:grid-cols-[1fr_auto_1fr]">
        <Logo />
        <nav className="hidden items-center justify-center gap-5 xl:gap-8 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              resetScroll
              className="link-underline text-[0.9375rem] text-foreground/80 hover:text-foreground md:text-base"
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-3 lg:col-start-3">
          {showVisitButton && (
            <ButtonLink to="/kontakt" className="hidden h-11 lg:inline-flex">
              Umów wizytę
            </ButtonLink>
          )}
          <button
            className="relative h-10 w-10 lg:hidden"
            onClick={toggleMobileMenu}
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
      </div>

      <div
        className={cn(
          "fixed inset-x-0 top-20 bottom-0 z-[60] lg:hidden",
          showMobileMenu ? "visible" : "invisible pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          className="absolute inset-0 bg-background max-lg:backdrop-blur-none"
          aria-hidden
        />
        <div
          className={cn(
            "relative container-site flex h-full flex-col justify-between pb-10 pt-8 transition-opacity duration-300",
            open ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <nav className="flex flex-col">
            {nav.map((n, i) => (
              <Link
                key={n.to}
                to={n.to}
                resetScroll
                onClick={closeMobileMenu}
                className="font-display border-b border-border py-4 text-4xl transition-all duration-500 max-lg:duration-300"
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
              <div onClick={closeMobileMenu}>
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
