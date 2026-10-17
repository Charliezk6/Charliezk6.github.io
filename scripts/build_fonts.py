"""Download self-hosted Latin faces and a Noto Serif SC subset. One-off."""
import pathlib
import re
import urllib.request
from urllib.parse import quote

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "fonts"
OUT.mkdir(parents=True, exist_ok=True)
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)


def fetch(url):
    last = None
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as res:
                return res.read()
        except Exception as error:
            last = error
            print("retry", attempt + 1, error)
    raise last


def collect_sample():
    blob = []
    for rel in ["index.html", "404.html", "js/i18n.js", "js/photos.js", "js/main.js"]:
        blob.append((ROOT / rel).read_text(encoding="utf-8"))
    text = "\n".join(blob)
    seen = set()
    chars = []
    for ch in text:
        if ch in seen:
            continue
        code = ord(ch)
        if code > 127 or ch in "·—…×":
            seen.add(ch)
            chars.append(ch)
    for ch in "，。、：；！？「」『』（）【】《》·—…～×／":
        if ch not in seen:
            seen.add(ch)
            chars.append(ch)
    return "".join(chars)


def faces_from_css(css, family, keep):
    blocks = re.findall(r"/\*([^*]+)\*/\s*@font-face\s*\{([^}]+)\}", css)
    if not blocks:
        blocks = [( "", block) for block in re.findall(r"@font-face\s*\{([^}]+)\}", css)]
    chosen = []
    for comment, block in blocks:
        weight = re.search(r"font-weight:\s*([^;]+)", block)
        style = re.search(r"font-style:\s*([^;]+)", block)
        urange = re.search(r"unicode-range:\s*([^;]+)", block)
        src = re.search(r"url\((https://[^)]+)\)", block)
        if not src:
            continue
        label = (comment or "").lower()
        rng = (urange.group(1) if urange else "").lower()
        if keep and not any(token in label or token in rng for token in keep):
            # latin files are commented "latin" by Google
            if "latin" not in label:
                continue
        chosen.append(
            {
                "weight": (weight.group(1).strip() if weight else "400"),
                "style": (style.group(1).strip() if style else "normal"),
                "url": src.group(1),
                "range": urange.group(1).strip() if urange else "",
            }
        )
    return chosen


def save_family(css_url, family, prefix, keep):
    css = fetch(css_url).decode("utf-8")
    faces = faces_from_css(css, family, keep)
    rules = []
    for index, face in enumerate(faces):
        data = fetch(face["url"])
        name = f"{prefix}-{index}.woff2"
        (OUT / name).write_bytes(data)
        urange = f"\n  unicode-range: {face['range']};" if face["range"] else ""
        rules.append(
            "@font-face {\n"
            f"  font-family: \"{family}\";\n"
            f"  font-style: {face['style']};\n"
            f"  font-weight: {face['weight']};\n"
            "  font-display: swap;\n"
            f"  src: url(\"../assets/fonts/{name}\") format(\"woff2\");{urange}\n"
            "}\n"
        )
        print(name, len(data), face["style"], face["weight"])
    return "".join(rules)


def main():
    sample = collect_sample()
    print("sample", len(sample))
    noto_css = (
        "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400&display=swap&text="
        + quote(sample)
    )
    rules = []
    rules.append(save_family(noto_css, "Noto Serif SC", "noto-serif-sc", []))
    rules.append(
        save_family(
            "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap",
            "Instrument Serif",
            "instrument-serif",
            ["latin"],
        )
    )
    rules.append(
        save_family(
            "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
            "Inter",
            "inter",
            ["latin"],
        )
    )
    (ROOT / "css" / "fonts.css").write_text("".join(rules), encoding="utf-8")
    print("wrote css/fonts.css")


if __name__ == "__main__":
    main()
