#!/usr/bin/env python3
"""
compress_pdf.py — Compress PDF files to 200 DPI in-place using Ghostscript.

Usage:
    python scripts/compress_pdf.py articles/01/slides/slides-mr.pdf
    python scripts/compress_pdf.py articles/*/slides/*.pdf
"""
import sys
import subprocess
import os
import glob


DPI = 200


def compress(path):
    if not os.path.isfile(path):
        print(f"  skip  {path}  (not found)")
        return

    orig_kb = os.path.getsize(path) // 1024
    tmp = path + ".__tmp__.pdf"

    cmd = [
        "gs",
        "-sDEVICE=pdfwrite",
        "-dNOPAUSE", "-dBATCH", "-dQUIET",
        "-dCompatibilityLevel=1.4",
        # downsample all image types to DPI
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
        # Clean up temp file if it exists
        if os.path.exists(tmp):
            os.remove(tmp)
        print(f"  ERROR {path}")
        print(result.stderr.decode(), file=sys.stderr)
        return

    new_kb = os.path.getsize(tmp) // 1024
    saving = 100 - (100 * new_kb // orig_kb) if orig_kb else 0
    os.replace(tmp, path)
    print(f"  ✓  {path}  {orig_kb} KB → {new_kb} KB  (−{saving}%)")


def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: python scripts/compress_pdf.py <file.pdf> [...]")
        sys.exit(1)

    # Expand any glob patterns (useful on Windows where the shell doesn't expand)
    paths = []
    for a in args:
        expanded = glob.glob(a)
        paths.extend(expanded if expanded else [a])

    for p in paths:
        compress(p)


if __name__ == "__main__":
    main()
