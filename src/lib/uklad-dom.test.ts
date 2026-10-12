import { describe, expect, it } from "vitest";
import {
  applyBreaks,
  clearLines,
  htmlWithoutLines,
  moveLineWord,
} from "./uklad-dom";

function wordsIn(root: ParentNode) {
  return [...root.querySelectorAll("[data-uklad-line]")].map((line) =>
    (line.textContent ?? "").replace(/\s+/g, " ").trim(),
  );
}

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
