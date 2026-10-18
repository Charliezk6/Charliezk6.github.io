"""Render a first-page WebP preview. Leave the PDF bytes alone.

An earlier rewrite_images pass replaced figure XObjects with 2×2 JPEGs,
so charts opened in a new tab as a flat blur. The files in assets/docs
are the pre-compression originals.
"""
from pathlib import Path

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


def main():
    for name in TARGETS:
        path = DOCS / name
        size, preview_bytes = render_first(path, PREVIEW / f"{path.stem}.webp")
        print(f"{name} pdf {path.stat().st_size} preview {size} {preview_bytes}")
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
