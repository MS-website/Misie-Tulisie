import { describe, expect, it } from "vitest";
import {
  applyBreaks,
  applyLayout,
  clearLines,
  htmlWithoutLines,
  isPhotoFrame,
  moveLineWord,
} from "./uklad-dom";

function wordsIn(root: ParentNode) {
  return [...root.querySelectorAll("[data-uklad-line]")].map((line) =>
    (line.textContent ?? "").replace(/\s+/g, " ").trim(),
  );
}

describe("layout boxes", () => {
  it("applies width and height to photo frames", () => {
    document.body.innerHTML =
      '<main><section><div class="rounded-md overflow-hidden"><img alt="test" src="/x.jpg" /></div></section></main>';
    const frame = document.querySelector("div.rounded-md");
    if (!frame || !(frame instanceof HTMLElement)) throw new Error("missing frame");
    expect(isPhotoFrame(frame)).toBe(true);
    applyLayout(document, "/", "lg", {
      "/": {
        lg: {
          "section:nth-of-type(1) > div:nth-of-type(1)": {
            x: 0,
            y: 0,
            z: 0,
            width: 320,
            height: 400,
          },
        },
      },
    });
    expect(frame.style.width).toBe("320px");
    expect(frame.style.height).toBe("400px");
    expect(frame.style.aspectRatio).toBe("auto");
  });

  it("moves inline links with saved offsets", () => {
    document.body.innerHTML =
      '<main><section><p class="eyebrow">Telefon</p><a href="tel:1">+48 791</a></section></main>';
    applyLayout(document, "/kontakt", "lg", {
      "/kontakt": {
        lg: {
          "section:nth-of-type(1) > a:nth-of-type(1)": { x: 12, y: 8, z: 0 },
        },
      },
    });
    const link = document.querySelector("a");
    if (!link) throw new Error("missing link");
    expect(link.style.display).toBe("inline-block");
    expect(link.style.translate).toBe("12px 8px");
  });
});

describe("line breaks", () => {
  it("moves the first word of a line up and the last word down", () => {
    expect(moveLineWord(6, [2, 4], 1, -1)).toEqual([3, 4]);
    expect(moveLineWord(6, [2, 4], 1, 1)).toEqual([2, 3]);
    expect(moveLineWord(6, [], 0, 1)).toEqual([4]);
    expect(moveLineWord(6, [2], 0, -1)).toBeNull();
  });

  it("splits a sentence into fixed lines and restores the source text", () => {
    document.body.innerHTML = "<p>Ala ma <em>kota i psa</em> oraz dom</p>";
    const paragraph = document.querySelector("p");
    if (!paragraph) throw new Error("missing paragraph");

    applyBreaks(paragraph, [1, 4]);

    expect(wordsIn(paragraph)).toEqual(["Ala ma", "kota i psa", "oraz dom"]);
    expect(htmlWithoutLines(paragraph)).toBe(
      "Ala ma <em>kota i psa</em> oraz dom",
    );

    clearLines(paragraph);
    expect(paragraph.querySelector("[data-uklad-line]")).toBeNull();
    expect(paragraph.textContent).toBe("Ala ma kota i psa oraz dom");
  });
});
