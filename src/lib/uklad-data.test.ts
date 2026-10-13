import { describe, expect, it } from "vitest";
import { normalizeLayout } from "./uklad-data";

describe("normalizeLayout", () => {
  it("keeps an older single layout on the computer size only", () => {
    const store = normalizeLayout({
      "/formularz-rekrutacyjny": {
        "section:nth-of-type(1)": {
          x: 3,
          y: 25,
          z: 2,
          originalHtml: "<b>a</b>",
          html: "<b>b</b>",
        },
      },
    });

    expect(
      store["/formularz-rekrutacyjny"]?.lg?.["section:nth-of-type(1)"],
    ).toEqual({ x: 3, y: 25, z: 2 });
    expect(store["/formularz-rekrutacyjny"]?.sm).toBeUndefined();
    expect(
      store["/formularz-rekrutacyjny"]?.text?.["section:nth-of-type(1)"],
    ).toEqual({
      html: "<b>b</b>",
      originalHtml: "<b>a</b>",
    });
  });

  it("keeps separate sizes", () => {
    const store = normalizeLayout({
      "/kontakt": {
        sm: { "h1:nth-of-type(1)": { x: 0, y: 40, z: 0 } },
        lg: { "h1:nth-of-type(1)": { x: 0, y: -20, z: 1 } },
      },
    });

    expect(store["/kontakt"]?.sm?.["h1:nth-of-type(1)"]?.y).toBe(40);
    expect(store["/kontakt"]?.lg?.["h1:nth-of-type(1)"]?.y).toBe(-20);
  });

  it("keeps text size and line breaks for one screen size", () => {
    const store = normalizeLayout({
      "/o-nas": {
        lg: {
          "h1:nth-of-type(1)": {
            x: 0,
            y: 0,
            z: 0,
            fontSize: 72,
            width: 420,
            breaks: [2, 2, 5, -1, 1.5],
          },
        },
      },
    });

    expect(store["/o-nas"]?.lg?.["h1:nth-of-type(1)"]).toEqual({
      x: 0,
      y: 0,
      z: 0,
      fontSize: 72,
      width: 420,
      breaks: [2, 5],
    });
    expect(store["/o-nas"]?.sm).toBeUndefined();
  });

});
