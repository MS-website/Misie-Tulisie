#!/usr/bin/env python3
"""Grafika Open Graph 1200×630 w stylu strony głównej."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "og-misie-tulisie.jpg"
LOGO = ROOT / "src" / "assets" / "misie-logo.png"
HERO = ROOT / "src" / "assets" / "story.jpg"

W, H = 1200, 630
BG = (252, 250, 246)
FG = (58, 52, 46)
HONEY = (168, 132, 92)
MUTED = (108, 102, 94)

FONT_SERIF = "/System/Library/Fonts/Supplemental/Georgia.ttf"
FONT_SERIF_ITALIC = "/System/Library/Fonts/Supplemental/Georgia Italic.ttf"
FONT_SANS = "/System/Library/Fonts/Supplemental/Arial.ttf"


def rounded_rect_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def fit_cover(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    scale = max(target_w / img.width, target_h / img.height)
    resized = img.resize(
        (int(img.width * scale), int(img.height * scale)), Image.Resampling.LANCZOS
    )
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def main() -> None:
    canvas = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(canvas)

    logo = Image.open(LOGO).convert("RGBA")
    logo_h = 72
    logo_w = int(logo.width * (logo_h / logo.height))
    logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    canvas.paste(logo, (64, 52), logo)

    font_brand = ImageFont.truetype(FONT_SERIF, 42)
    draw.text((64 + logo_w + 18, 68), "Misie Tulisie", font=font_brand, fill=FG)

    font_eyebrow = ImageFont.truetype(FONT_SANS, 15)
    eyebrow = "ŻŁOBEK W GNIEŹNIE"
    draw.text((64, 148), eyebrow, font=font_eyebrow, fill=HONEY)

    font_h1 = ImageFont.truetype(FONT_SERIF, 58)
    font_h1_italic = ImageFont.truetype(FONT_SERIF_ITALIC, 58)
    lines = [
        ("Miejsce,", FG, font_h1),
        ("w którym małe", FG, font_h1),
        ("kroki mają", FG, font_h1),
    ]
    y = 178
    for text, color, font in lines:
        draw.text((64, y), text, font=font, fill=color)
        y += int(font.size * 1.05)

    draw.text((64, y), "wielkie", font=font_h1_italic, fill=HONEY)
    wielkie_w = draw.textlength("wielkie", font=font_h1_italic)
    draw.text((64 + wielkie_w + 10, y), "znaczenie", font=font_h1, fill=FG)

    photo_w, photo_h, radius = 400, 500, 28
    photo_x, photo_y = W - photo_w - 64, (H - photo_h) // 2
    hero = Image.open(HERO).convert("RGB")
    hero = fit_cover(hero, photo_w, photo_h)
    mask = rounded_rect_mask((photo_w, photo_h), radius)
    canvas.paste(hero, (photo_x, photo_y), mask)

    font_lead = ImageFont.truetype(FONT_SANS, 22)
    lead = "Bezpieczna, ciepła przestrzeń dla maluchów w Gnieźnie."
    draw.text((64, H - 72), lead, font=font_lead, fill=MUTED)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT, "JPEG", quality=90, optimize=True, subsampling=0)
    print(f"Wrote {OUT} ({OUT.stat().st_size // 1024} KiB)")


if __name__ == "__main__":
    main()
