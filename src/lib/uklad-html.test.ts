import { describe, expect, it } from "vitest";
import savedFile from "@/uklad.json";
import { normalizeLayout } from "./uklad-data";
import {
  inlineContinuationHtml,
  sanitizeUkladHtml,
  splitParagraphHtml,
} from "./uklad-html";

const store = normalizeLayout(savedFile);

function differing() {
  const items: { pathname: string; selector: string; html: string }[] = [];
  for (const [pathname, page] of Object.entries(store)) {
    for (const [selector, text] of Object.entries(page.text ?? {})) {
      if (text.html === text.originalHtml) continue;
      items.push({ pathname, selector, html: text.html });
    }
  }
  return items;
}

describe("sanitizeUkladHtml", () => {
  it("przepuszcza wszystkie różniące się fragmenty bez zmiany treści", () => {
    const items = differing();
    expect(items).toHaveLength(57);
    for (const item of items) {
      expect(sanitizeUkladHtml(item.html), item.selector).toBe(item.html);
    }
  });

  it("rozdziela div wychodzący z akapitu bez zmiany treści", () => {
    const paragraphs = differing().filter((item) =>
      /p:nth-of-type\(\d+\)$/.test(item.selector),
    );
    const split = paragraphs.filter((item) => item.html.includes("<div"));
    expect(split.length).toBeGreaterThan(0);
    for (const item of split) {
      const parts = splitParagraphHtml(item.html);
      expect(parts, item.selector).not.toBeNull();
      const rebuilt =
        parts!.phrasing + parts!.blocks.map((block) => `<div>${block}</div>`).join("");
      expect(rebuilt, item.selector).toBe(item.html);
    }
  });

  it("odrzuca niebezpieczne znaczniki i atrybuty", () => {
    expect(sanitizeUkladHtml('<script>alert(1)</script>')).toBeNull();
    expect(sanitizeUkladHtml('<img src="x" onerror="alert(1)">')).toBeNull();
    expect(sanitizeUkladHtml('<a href="javascript:alert(1)">x</a>')).toBeNull();
    expect(sanitizeUkladHtml('<span onclick="alert(1)">x</span>')).toBeNull();
    expect(sanitizeUkladHtml('<iframe src="https://example.com"></iframe>')).toBeNull();
    expect(
      sanitizeUkladHtml('<span style="background:url(https://example.com/a.png)">x</span>'),
    ).toBeNull();
    expect(sanitizeUkladHtml('<button type="button">Pytanie</button>')).toBeNull();
    expect(sanitizeUkladHtml('<div><span>otwarte')).toBeNull();
  });
});

describe("inlineContinuationHtml", () => {
  it("łączy jednoliterową spójnik z następnym słowem", () => {
    expect(inlineContinuationHtml("z innymi.")).toBe("z\u00A0innymi.");
  });
});
