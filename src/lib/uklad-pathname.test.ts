import { describe, expect, it } from "vitest";
import { layoutPathname } from "./uklad-pathname";

describe("layoutPathname", () => {
  it("przy hydratacji podstrony wybiera URL zamiast chwilowego /", () => {
    expect(layoutPathname("/", "/o-nas")).toBe("/o-nas");
  });

  it("po nawigacji SPA zostaje przy ścieżce routera", () => {
    expect(layoutPathname("/kontakt", "/")).toBe("/kontakt");
  });
});

describe("pathnameFromMatches", () => {
  it("używa pathname liścia matcha zamiast docelowego location", () => {
    const fromMatches = (
      matches: { pathname?: string }[],
      fallback: string,
    ) => {
      const leaf = matches.at(-1);
      if (leaf?.pathname) return leaf.pathname;
      return fallback;
    };
    expect(
      fromMatches(
        [{ pathname: "/dla-rodzicow" }, { pathname: "/dla-rodzicow" }],
        "/rekrutacja",
      ),
    ).toBe("/dla-rodzicow");
  });
});
