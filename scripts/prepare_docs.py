"""Render a first-page WebP preview and recompress each PDF."""
import os
from pathlib import Path

import fitz
import pypdfium2 as pdfium
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "assets" / "docs"
PREVIEW = DOCS / "preview"
PREVIEW.mkdir(exist_ok=True)
TARGETS = [
    "apmcm-paper.pdf",
    "apmcm-award.pdf",
    "huashu-paper.pdf",
    "xiong-award.pdf",
]


def render_first(path, dest):
    pdf = pdfium.PdfDocument(str(path))
    page = pdf[0]
    scale = 1400 / page.get_width()
    bitmap = page.render(scale=scale)
    image = bitmap.to_pil().convert("RGB")
    image.save(dest, "WEBP", quality=76, method=6)
    pdf.close()
    return image.size, dest.stat().st_size


def compress(path):
    before = path.stat().st_size
    doc = fitz.open(path)
    # Certificates are one placed image plus vectors. Rewriting images
    # drops the medal, ribbon, and seals and leaves a blank panel.
    if "award" not in path.name and hasattr(doc, "rewrite_images"):
        doc.rewrite_images(dpi_threshold=110, quality=62)
    temp = path.with_suffix(".tmp.pdf")
    doc.save(temp, garbage=4, deflate=True, deflate_images=True, clean=True)
    doc.close()
    after = temp.stat().st_size
    if after < before:
        temp.replace(path)
    else:
        temp.unlink()
        after = before
    return before, after


def main():
    for name in TARGETS:
        path = DOCS / name
        before, after = compress(path)
        size, preview_bytes = render_first(path, PREVIEW / f"{path.stem}.webp")
        print(f"{name} pdf {before} -> {after} preview {size} {preview_bytes}")
    award = DOCS / "huashu-award.png"
    image = Image.open(award).convert("RGB")
    edge = 1600
    scale = edge / max(image.size)
    if scale < 1:
        image = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    dest = PREVIEW / "huashu-award.webp"
    image.save(dest, "WEBP", quality=76, method=6)
    print(f"huashu-award.png {award.stat().st_size} preview {image.size} {dest.stat().st_size}")


if __name__ == "__main__":
    main()
