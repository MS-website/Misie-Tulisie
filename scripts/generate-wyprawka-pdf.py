#!/usr/bin/env python3
"""Generuje public/wyprawka-misie-tulisie.pdf (A4, polskie znaki)."""

from __future__ import annotations

from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "wyprawka-misie-tulisie.pdf"

FONT_CANDIDATES = (
    ROOT / "scripts" / "fonts" / "DejaVuSans.ttf",
    Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
    Path("/Library/Fonts/Arial.ttf"),
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
)

ITEMS = [
    "Pościel + prześcieradło do leżaczka o wymiarach 132,5 x 59.",
    "Pampersy (podpisane opakowanie).",
    "Mokre chusteczki (podpisane opakowanie).",
    "Śliniaczek gumowy lub plastikowy z korytkiem.",
    "Ubranka na zmianę , w tym skarpetki, body, bluzeczki, spodnie(najlepiej dresowe lub leginsy).",
    "Kubeczek (jeżeli dziecko nie pije jeszcze ze standardowego kubka).",
    "Krem na odparzenia dla niemowląt(może być też sudocrem).",
    "Ulubiona przytulanka do spania, jeżeli dziecku ułatwia zaśnięcie – bardzo mile widziana.",
    "Rolka ręczników papierowych (raz na 3 miesiące).",
    "Zestaw do mycia ząbków (kubeczek, pasta, szczoteczka).",
]

NOTE = (
    "Prosimy aby wszystkie rzeczy były podpisane na specjalnych naklejanych "
    "etykietkach bądź markerem."
)


def register_font() -> str:
    for path in FONT_CANDIDATES:
        if path.is_file():
            name = "WyprawkaBody"
            pdfmetrics.registerFont(TTFont(name, str(path)))
            return name
    raise SystemExit(
        "Brak czcionki z polskimi znakami. Dodaj DejaVuSans.ttf do scripts/fonts/ "
        "lub uruchom na systemie z Arial."
    )


def wrap(text: str, font: str, size: float, max_width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if pdfmetrics.stringWidth(trial, font, size) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def main() -> None:
    font = register_font()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=A4)
    width, height = A4
    margin = 22 * mm
    content_w = width - 2 * margin
    y = height - margin

    c.setFont(font, 11)
    c.setFillColorRGB(0.45, 0.42, 0.38)
    c.drawString(margin, y, "Żłobek Misie Tulisie · Gniezno")
    y -= 14 * mm

    c.setFont(font, 22)
    c.setFillColorRGB(0.15, 0.14, 0.13)
    c.drawString(margin, y, "Lista wyprawkowa")
    y -= 10 * mm

    c.setFont(font, 10.5)
    c.setFillColorRGB(0.35, 0.33, 0.3)
    c.drawString(margin, y, "Zaznacz przygotowane rzeczy przed pierwszym dniem w żłobku.")
    y -= 12 * mm

    box = 4.5 * mm
    gap = 5 * mm
    line_h = 5.2 * mm
    size = 10.5

    for i, item in enumerate(ITEMS, start=1):
        lines = wrap(f"{i}. {item}", font, size, content_w - box - gap)
        block_h = len(lines) * line_h
        if y - block_h < margin + 20 * mm:
            c.showPage()
            y = height - margin
            c.setFont(font, size)

        box_y = y - box + 1 * mm
        c.setStrokeColorRGB(0.55, 0.52, 0.48)
        c.setLineWidth(0.6)
        c.rect(margin, box_y, box, box, stroke=1, fill=0)

        text_x = margin + box + gap
        c.setFillColorRGB(0.2, 0.18, 0.16)
        for j, line in enumerate(lines):
            c.drawString(text_x, y - j * line_h, line)
        y -= block_h + 4 * mm

    y -= 4 * mm
    c.setFont(font, 10.5)
    c.setFillColorRGB(0.15, 0.14, 0.13)
    for line in wrap(NOTE, font, 10.5, content_w):
        c.drawString(margin, y, line)
        y -= line_h

    c.save()
    print(f"Zapisano: {OUT}")


if __name__ == "__main__":
    main()
