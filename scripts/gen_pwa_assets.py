#!/usr/bin/env python3
"""Generate PWA icon and splash screen PNGs from SVG templates.

Outputs:
  assets/images/icon-192.png    — 192×192 app icon
  assets/images/icon-512.png    — 512×512 app icon
  assets/images/splash.png      — 853×1844 PWA install screenshot
"""

import os, sys
from pathlib import Path

try:
    import cairosvg
except ImportError:
    sys.exit("cairosvg not found — run: pip3 install cairosvg")

ROOT = Path(__file__).resolve().parent.parent
OUT  = ROOT / "assets" / "images"
OUT.mkdir(parents=True, exist_ok=True)

# ── Palette ───────────────────────────────────────────
BG       = "#F2E9D5"   # parchment
BG2      = "#EAE0C6"   # parchment-2 (darker)
ACCENT   = "#B14820"   # saffron accent
GOLD     = "#9C7A2A"   # gold
RULE     = "#C9B996"   # rule / border
INK      = "#1E1812"   # ink

# ── Gandaberunda bird paths (from iks-icon.svg) ───────
# Original viewBox: -32 -32 64 64  →  centre at (0,0), radius ~30
BIRD_SVG = """
  <!-- outer ring + dots -->
  <g fill="none" stroke="{c}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
    <circle cx="0" cy="0" r="29"/>
    <circle cx="0" cy="0" r="27" stroke-width="0.6"/>
  </g>
  <g fill="{c}" stroke="none">
    <circle cx="0"    cy="-30.5" r="0.9"/>
    <circle cx="11.7" cy="-28.2" r="0.9"/>
    <circle cx="21.6" cy="-21.6" r="0.9"/>
    <circle cx="28.2" cy="-11.7" r="0.9"/>
    <circle cx="30.5" cy="0"     r="0.9"/>
    <circle cx="28.2" cy="11.7"  r="0.9"/>
    <circle cx="21.6" cy="21.6"  r="0.9"/>
    <circle cx="11.7" cy="28.2"  r="0.9"/>
    <circle cx="0"    cy="30.5"  r="0.9"/>
    <circle cx="-11.7" cy="28.2" r="0.9"/>
    <circle cx="-21.6" cy="21.6" r="0.9"/>
    <circle cx="-28.2" cy="11.7" r="0.9"/>
    <circle cx="-30.5" cy="0"    r="0.9"/>
    <circle cx="-28.2" cy="-11.7" r="0.9"/>
    <circle cx="-21.6" cy="-21.6" r="0.9"/>
    <circle cx="-11.7" cy="-28.2" r="0.9"/>
  </g>
  <!-- bird body + heads + wings + tail -->
  <g fill="{c}" stroke="{c}" stroke-width="0.4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="-7.5" cy="-13" rx="3.4" ry="2.8" transform="rotate(-12 -7.5 -13)"/>
    <path d="M -10.6 -13.4 L -14.5 -12.2 L -12 -11 Z"/>
    <circle cx="-9"   cy="-18"   r="1.2"/>
    <circle cx="-5.5" cy="-18.5" r="1"/>
    <ellipse cx="7.5" cy="-13" rx="3.4" ry="2.8" transform="rotate(12 7.5 -13)"/>
    <path d="M 10.6 -13.4 L 14.5 -12.2 L 12 -11 Z"/>
    <circle cx="9"   cy="-18"   r="1.2"/>
    <circle cx="5.5" cy="-18.5" r="1"/>
    <path d="M -5 -11 C -3 -7 -1.5 -5 0 -4 C 1.5 -5 3 -7 5 -11 C 4 -8 2.5 -7 0 -7 C -2.5 -7 -4 -8 -5 -11 Z"/>
    <path d="M -5 -5 C -10 -5 -14 -2 -14 4 C -13 7 -10 8 -7 6 C -5 4 -4 1 -4 -2 Z"/>
    <path d="M  5 -5 C 10 -5 14 -2 14 4 C 13 7 10 8 7 6 C 5 4 4 1 4 -2 Z"/>
    <path d="M 0 -6 C -4.5 -5 -6 -2 -6 2 C -6 7 -3 12 0 14 C 3 12 6 7 6 2 C 6 -2 4.5 -5 0 -6 Z"/>
    <path d="M 0 13 L -8 22 L -4 19 Z"/>
    <path d="M 0 13 L -4 23 L -1 20 Z"/>
    <path d="M 0 13 L  0 24 L  2 21 L 1 20 Z"/>
    <path d="M 0 13 L  4 23 L  1 20 Z"/>
    <path d="M 0 13 L  8 22 L  4 19 Z"/>
  </g>
  <!-- body scale marks -->
  <g fill="none" stroke="{c}" stroke-width="0.5">
    <path d="M -2 2 q 2 -2 4 0"/>
    <path d="M -2 5 q 2 -2 4 0"/>
    <path d="M -2 8 q 2 -2 4 0"/>
  </g>
""".strip()


def bird_at(cx, cy, scale, color=ACCENT):
    """Return a <g> that renders the bird centred at (cx,cy) at the given scale."""
    paths = BIRD_SVG.replace("{c}", color)
    return f'<g transform="translate({cx} {cy}) scale({scale})">\n{paths}\n</g>'


# ── Icon SVG ──────────────────────────────────────────
def make_icon_svg(size=512):
    """Square icon: parchment background + centred bird emblem."""
    # The bird viewBox is 64 units wide; leave ~14% padding on each side
    scale = size / 64 * 0.72        # 72% of full size → ~14% padding each side
    cx = size / 2
    cy = size / 2
    r  = size * 0.48                # slight inset for rounded feel
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">
  <rect width="{size}" height="{size}" fill="{BG}"/>
  <!-- subtle inner frame -->
  <rect x="0" y="0" width="{size}" height="{size}" fill="none"
        stroke="{RULE}" stroke-width="2"/>
  {bird_at(cx, cy, scale)}
</svg>"""


# ── Splash screen SVG (853 × 1844) ───────────────────
def make_splash_svg(w=853, h=1844):
    """PWA install screenshot — branded vertical card."""
    bird_scale = w / 64 * 0.52     # bird takes ~52% of width
    bird_cx    = w / 2
    bird_cy    = h * 0.38          # slightly above centre

    # Decorative horizontal rules
    rule_y1 = h * 0.64
    rule_y2 = h * 0.78

    # Title block
    title_mr_y  = h * 0.67        # "भारतीय ज्ञानप्रणाली व वारसा"
    title_en_y  = h * 0.735       # "Elements of Indian Knowledge Systems"
    sub_y       = h * 0.80        # tagline
    foot_y      = h * 0.94

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
  <!-- background -->
  <rect width="{w}" height="{h}" fill="{BG}"/>
  <!-- paper grain bands -->
  <rect x="0" y="0"         width="{w}" height="{h*0.55}"  fill="{BG2}" opacity="0.35"/>
  <rect x="0" y="{h*0.92}"  width="{w}" height="{h*0.08}" fill="{BG2}" opacity="0.50"/>

  <!-- bird emblem -->
  {bird_at(bird_cx, bird_cy, bird_scale)}

  <!-- decorative rules -->
  <line x1="{w*0.12}" y1="{rule_y1}" x2="{w*0.88}" y2="{rule_y1}"
        stroke="{RULE}" stroke-width="1.5"/>
  <line x1="{w*0.12}" y1="{rule_y2}" x2="{w*0.88}" y2="{rule_y2}"
        stroke="{RULE}" stroke-width="1"/>

  <!-- diamond ornament -->
  <polygon points="{w/2},{rule_y1-9}  {w/2+9},{rule_y1}  {w/2},{rule_y1+9}  {w/2-9},{rule_y1}"
           fill="{GOLD}" opacity="0.6"/>

  <!-- Marathi title -->
  <text x="{w/2}" y="{title_mr_y}"
        font-family="'Noto Sans Devanagari', 'Devanagari MT', sans-serif"
        font-size="{w*0.076}" font-weight="600"
        fill="{INK}" text-anchor="middle">
    भारतीय ज्ञानप्रणाली व वारसा
  </text>

  <!-- English title -->
  <text x="{w/2}" y="{title_en_y}"
        font-family="'Cormorant Garamond', 'Georgia', serif"
        font-size="{w*0.052}" font-style="italic" font-weight="400"
        fill="{ACCENT}" text-anchor="middle">
    Elements of Indian Knowledge Systems
  </text>

  <!-- sub -->
  <text x="{w/2}" y="{sub_y}"
        font-family="'Cormorant Garamond', 'Georgia', serif"
        font-size="{w*0.036}" font-style="italic"
        fill="{GOLD}" text-anchor="middle" letter-spacing="2">
    A bilingual heritage edition
  </text>

  <!-- footer -->
  <text x="{w/2}" y="{foot_y}"
        font-family="'Cormorant Garamond', 'Georgia', serif"
        font-size="{w*0.028}" fill="{RULE}" text-anchor="middle" letter-spacing="1">
    vivek-sovani.github.io/IKS
  </text>
</svg>"""


# ── Generate PNGs ─────────────────────────────────────
def svg_to_png(svg_str, out_path, width, height):
    cairosvg.svg2png(
        bytestring=svg_str.encode("utf-8"),
        write_to=str(out_path),
        output_width=width,
        output_height=height,
    )
    print(f"  ✓  {out_path.relative_to(ROOT)}  ({width}×{height})")


print("Generating PWA assets…")

svg_to_png(make_icon_svg(512),  OUT / "icon-512.png",  512, 512)
svg_to_png(make_icon_svg(192),  OUT / "icon-192.png",  192, 192)
svg_to_png(make_splash_svg(),   OUT / "splash.png",    853, 1844)

print("Done.")
