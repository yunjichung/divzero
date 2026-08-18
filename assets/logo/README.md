# DivZero Logo Kit

The DivZero wordmark: **DivZ** set in Schibsted Grotesk SemiBold, with **ero**
merged into a custom infinity knot — the e's bowl and the o become the two
loops, the r's stem stands at the crossing with the diagonals woven behind it.
*Like division by zero, we aim toward infinity.*

## Files

| File | Use |
| --- | --- |
| `divzero-logotype.svg` / `-dark` / `-white` (+ `.png`) | **DIVZERO logotype** — the site's own all-caps wordmark, Pretendard 430 at −0.024em tracking, outlined |
| `divzero-wordmark.svg` | Primary wordmark, near-black ink — light backgrounds |
| `divzero-wordmark-dark.svg` | Warm off-white `#f3f0e9` ink — the site / dark backgrounds |
| `divzero-mark.svg` / `divzero-mark-dark.svg` | Standalone ∞ monogram (chunkier stroke) — avatars, small placements, embroidery |
| `divzero-wordmark-white.svg` / `.png`, `divzero-mark-white.svg` / `.png` | Pure-white variants for merch/embroidery on dark garments |
| `favicon.svg` | Square-viewBox monogram; ink auto-switches with `prefers-color-scheme` |
| `divzero-wordmark.png` / `-dark.png` | 2400 px transparent PNG exports |
| `divzero-mark.png` / `-dark.png` | 1024 px transparent PNG exports |
| `src/generate-logotype.py` | Rebuilds the DIVZERO logotype from `src/pretendard-430-caps.json` |
| `src/generate.py` | Rebuilds every SVG from `src/schibsted-600-glyphs.json` — all geometry is parametric |

## Usage notes

- Clear space: keep at least one knot-loop-width of air around the mark.
- Minimum sizes: wordmark ≥ 120 px wide on screen; below that, use the monogram.
- Embroidery: use the **monogram** (stroke ≈ 6 % of width — satin-stitch safe at
  6 cm). The wordmark embroiders cleanly at ≥ 9 cm wide.
- Don't recolor beyond the two inks, don't outline, don't stretch.

## Type & license

Letterforms derive from [Schibsted Grotesk](https://fonts.google.com/specimen/Schibsted+Grotesk)
SemiBold (© Schibsted, SIL Open Font License 1.1). Glyphs are outlined —
no webfont required. The knot is original geometry (see `src/generate.py`).
