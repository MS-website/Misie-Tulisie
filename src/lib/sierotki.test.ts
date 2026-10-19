import { describe, expect, it } from "vitest";
import { bindSingleLetters } from "./sierotki";

const NBSP = "\u00A0";

describe("bindSingleLetters", () => {
  it("skleja jednoliterowe wyrazy z następnym słowem", () => {
    expect(bindSingleLetters("Żłobek w Gnieźnie i okolicach")).toBe(
      `Żłobek w${NBSP}Gnieźnie i${NBSP}okolicach`,
    );
  });

  it("obsługuje kilka spójników z rzędu i wielkie litery", () => {
    expect(bindSingleLetters("W domu i w żłobku")).toBe(
      `W${NBSP}domu i${NBSP}w${NBSP}żłobku`,
    );
  });

  it("działa po nawiasie i cudzysłowie", () => {
    expect(bindSingleLetters("(z dziećmi) „a potem”")).toBe(
      `(z${NBSP}dziećmi) „a${NBSP}potem”`,
    );
  });

  it("nie rusza liter wewnątrz słów", () => {
    expect(bindSingleLetters("Misie Tulisie zapraszają")).toBe(
      "Misie Tulisie zapraszają",
    );
  });
});
