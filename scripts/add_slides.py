#!/usr/bin/env python3
"""
add_slides.py — Import NotebookLM slide PDFs into the IKS articles tree.

Finds "slides NN en.pdf" / "slides NN mr.pdf" in ~/Downloads (or a given
folder), removes the NotebookLM watermark from every page, compresses to
200 DPI, and writes to articles/NN/slides/slides-{en,mr}.pdf.

Usage:
    python3 scripts/add_slides.py 33
    python3 scripts/add_slides.py 33 34 35
    python3 scripts/add_slides.py 33-40
    python3 scripts/add_slides.py --all
    python3 scripts/add_slides.py 33 --src ~/Desktop
    python3 scripts/add_slides.py 33 --no-compress   # skip Ghostscript step

Requirements:
    pip install pymupdf pillow
    brew install ghostscript  (for --compress, which is the default)
"""

import argparse
import glob
import io
import os
import subprocess
import sys

try:
    import fitz
    from PIL import Image, ImageDraw
except ImportError:
    sys.exit("Missing dependencies. Run: pip install pymupdf pillow")

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_SRC = os.path.expanduser("~/Downloads")
DPI = 200
SCALE = 2  # render pages at 2× for quality before covering watermark

# Bottom-right region to blank (at SCALE×, relative to page bottom-right)
MASK_W = 380
MASK_H = 70
# Pixel used to sample background colour (offset from mask top-left corner)
SAMPLE_OFFSET_X = -40
SAMPLE_OFFSET_Y = 10


# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------

def parse_args():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("articles", nargs="*",
                   help="Article number(s) or range, e.g. 33 or 33-40")
    p.add_argument("--all", action="store_true",
                   help="Process every slides-NN-*.pdf found in --src")
    p.add_argument("--src", default=DEFAULT_SRC,
                   help=f"Folder to search for source PDFs (default: {DEFAULT_SRC})")
    p.add_argument("--no-compress", action="store_true",
                   help="Skip Ghostscript compression step")
    return p.parse_args()


def expand_nums(tokens):
    """Turn ['33', '35-37'] → [33, 35, 36, 37]."""
    nums = []
    for t in tokens:
        if "-" in t:
            lo, hi = t.split("-", 1)
            nums.extend(range(int(lo), int(hi) + 1))
        else:
            nums.append(int(t))
    return sorted(set(nums))


# ---------------------------------------------------------------------------
# Core processing
# ---------------------------------------------------------------------------

def remove_watermark(src_path, dst_path):
    """Render every page, blank the bottom-right watermark, save to dst."""
    doc = fitz.open(src_path)
    out = fitz.open()
    mat = fitz.Matrix(SCALE, SCALE)

    for page in doc:
        pix = page.get_pixmap(matrix=mat)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        w, h = img.size

        # Sample background colour just outside the watermark area
        sx = w - MASK_W + SAMPLE_OFFSET_X
        sy = h - MASK_H + SAMPLE_OFFSET_Y
        bg = img.getpixel((max(sx, 0), max(sy, 0)))

        # Blank the watermark region
        draw = ImageDraw.Draw(img)
        draw.rectangle([(w - MASK_W, h - MASK_H), (w, h)], fill=bg)

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)

        new_page = out.new_page(width=page.rect.width, height=page.rect.height)
        new_page.insert_image(new_page.rect, stream=buf.read())

    out.save(dst_path)
    doc.close()
    out.close()


def compress_pdf(path):
    """Compress PDF in-place to DPI using Ghostscript."""
    tmp = path + ".__gs_tmp__.pdf"
    cmd = [
        "gs",
        "-sDEVICE=pdfwrite",
        "-dNOPAUSE", "-dBATCH", "-dQUIET",
        "-dCompatibilityLevel=1.4",
        "-dDownsampleColorImages=true",
        f"-dColorImageResolution={DPI}",
        "-dColorImageDownsampleType=/Bicubic",
        "-dDownsampleGrayImages=true",
        f"-dGrayImageResolution={DPI}",
        "-dGrayImageDownsampleType=/Bicubic",
        "-dDownsampleMonoImages=true",
        f"-dMonoImageResolution={DPI}",
        f"-sOutputFile={tmp}",
        path,
    ]
    result = subprocess.run(cmd, capture_output=True)
    if result.returncode != 0:
        os.remove(tmp)
        raise RuntimeError(f"Ghostscript failed:\n{result.stderr.decode()}")
    before = os.path.getsize(path)
    after = os.path.getsize(tmp)
    os.replace(tmp, path)
    return before, after


def find_source(src_dir, num, lang):
    """Find 'slides NN lang.pdf' or 'slides NN lang.pdf' (case-insensitive)."""
    pattern = os.path.join(src_dir, f"slides {num} {lang}.pdf")
    matches = glob.glob(pattern)
    if not matches:
        # Try with zero-padded number
        pattern = os.path.join(src_dir, f"slides {num:02d} {lang}.pdf")
        matches = glob.glob(pattern)
    return matches[0] if matches else None


def process_article(num, src_dir, do_compress):
    nn = f"{num:02d}"
    dest_dir = os.path.join(REPO_ROOT, "articles", nn, "slides")
    os.makedirs(dest_dir, exist_ok=True)

    any_done = False
    for lang in ("en", "mr"):
        src = find_source(src_dir, num, lang)
        if not src:
            print(f"  skip  {nn} {lang}: not found in {src_dir}")
            continue

        dest = os.path.join(dest_dir, f"slides-{lang}.pdf")
        tmp_clean = f"/tmp/iks_slides_{nn}_{lang}_clean.pdf"

        print(f"  {nn} {lang}: removing watermark …", end=" ", flush=True)
        remove_watermark(src, tmp_clean)
        print("done", end="")

        if do_compress:
            before, after = compress_pdf(tmp_clean)
            pct = round((1 - after / before) * 100) if before else 0
            print(f"  →  {after // 1024} KB  (−{pct}%)", end="")

        os.replace(tmp_clean, dest)
        size_kb = os.path.getsize(dest) // 1024
        print(f"  →  articles/{nn}/slides/slides-{lang}.pdf  [{size_kb} KB]")
        any_done = True

    return any_done


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    args = parse_args()

    if args.all:
        # Discover all "slides NN lang.pdf" files in src_dir
        found = glob.glob(os.path.join(args.src, "slides * *.pdf"))
        nums = set()
        for f in found:
            parts = os.path.basename(f).split()
            if len(parts) >= 2 and parts[1].isdigit():
                nums.add(int(parts[1]))
        article_nums = sorted(nums)
        if not article_nums:
            sys.exit(f"No matching slides found in {args.src}")
    elif args.articles:
        article_nums = expand_nums(args.articles)
    else:
        sys.exit("Specify article numbers, a range (33-40), or --all.")

    do_compress = not args.no_compress
    if do_compress and subprocess.run(["which", "gs"], capture_output=True).returncode != 0:
        print("Warning: Ghostscript not found. Skipping compression (install with: brew install ghostscript)")
        do_compress = False

    print(f"\nProcessing {len(article_nums)} article(s): {article_nums}")
    print(f"Source: {args.src}  |  Compress: {do_compress}\n")

    processed = []
    for num in article_nums:
        if process_article(num, args.src, do_compress):
            processed.append(num)

    if processed:
        print(f"\nDone. {len(processed)} article(s) updated: {processed}")
        print("\nNext steps:")
        nums_str = " ".join(f"articles/{n:02d}/slides/" for n in processed)
        print(f"  git add {nums_str}")
        print(f"  git commit -m 'Articles {processed[0]:02d}–{processed[-1]:02d}: add slides (watermark removed, {DPI} DPI)'")
        print(f"  git push origin HEAD:main")
    else:
        print("\nNo files processed.")


if __name__ == "__main__":
    main()
