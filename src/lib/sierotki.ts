const SINGLE_LETTER = /(?<=^|[\s(„"«])([aiouwzAIOUWZ])[ \t\r\n]+/g;

/** Skleja jednoliterowe wyrazy z następnym słowem twardą spacją. */
export function bindSingleLetters(text: string): string {
  return text.replace(SINGLE_LETTER, "$1\u00A0");
}
