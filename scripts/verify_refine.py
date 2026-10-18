"""Screenshots and checks for the now-section / carousel pass."""
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parents[1] / "pr-shots"
OUT.mkdir(exist_ok=True)
ORIGIN = "http://127.0.0.1:8771/"
problems = []
console_errors = []


def prepare(page, lang):
    page.goto(ORIGIN, wait_until="domcontentloaded")
    page.evaluate("(value) => localStorage.setItem('kz-lang', value)", lang)
    page.goto(ORIGIN, wait_until="load")
    page.wait_for_timeout(400)


def plate(page):
    return page.evaluate(
        """() => {
          const img = document.querySelector('.hero-slide.is-current');
          return img ? img.currentSrc.split('/').pop() : '';
        }"""
    )


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page()
        page.on("pageerror", lambda error: console_errors.append(str(error)))
        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)

        for lang in ("zh", "en"):
            prepare(page, lang)
            edges = {}
            for width in (1440, 1920, 390):
                height = 900 if width > 500 else 844
                page.set_viewport_size({"width": width, "height": height})
                page.wait_for_timeout(250)
                page.screenshot(path=str(OUT / f"refine-{lang}-{width}.png"))
                box = page.evaluate("() => ({scroll: document.documentElement.scrollWidth, view: innerWidth})")
                if box["scroll"] > box["view"] + 1:
                    problems.append(f"overflow {lang} {width} {box}")
                if width >= 1440:
                    edges[width] = page.evaluate(
                        """() => {
                          const copy = document.querySelector('.hero-copy').getBoundingClientRect();
                          const photo = document.querySelector('.hero-stage').getBoundingClientRect();
                          return {copy: Math.round(copy.left), photo: Math.round(photo.left), copyW: Math.round(copy.width)};
                        }"""
                    )
            print(lang, edges)

        page.set_viewport_size({"width": 1440, "height": 900})
        prepare(page, "zh")
        first = plate(page)
        page.wait_for_timeout(10000)
        later = plate(page)
        switches = page.evaluate("() => window.__heroSwitches || 0")
        print("carousel", first, "->", later)
        if first == later:
            problems.append("carousel did not advance in 10s")

        frozen = plate(page)
        page.evaluate("() => document.getElementById('writing').scrollIntoView()")
        page.wait_for_timeout(4000)
        if plate(page) != frozen:
            problems.append("carousel kept running offscreen")
        page.evaluate("() => window.scrollTo(0, 0)")
        page.wait_for_timeout(4500)
        if plate(page) == frozen:
            problems.append("carousel did not resume after returning")

        context = browser.new_context()
        reduced = context.new_page()
        reduced.emulate_media(reduced_motion="reduce")
        reduced.set_viewport_size({"width": 1440, "height": 900})
        reduced.goto(ORIGIN, wait_until="load")
        reduced.evaluate("() => localStorage.setItem('kz-lang','zh')")
        reduced.reload(wait_until="load")
        held = plate(reduced)
        reduced.wait_for_timeout(7000)
        if plate(reduced) != held:
            problems.append("reduced motion still autoplayed")
        reduced.locator("#hero-next").click()
        reduced.wait_for_timeout(400)
        if plate(reduced) == held:
            problems.append("manual next did not change the reduced-motion slide")
        context.close()

        page.locator("#computing").scroll_into_view_if_needed()
        page.locator(".doc-key").first.click()
        page.wait_for_selector(".doc-page img", timeout=5000)
        page.wait_for_timeout(500)
        page.screenshot(path=str(OUT / "refine-zh-1440-doc.png"))
        page.locator("#now").scroll_into_view_if_needed()
        page.wait_for_timeout(200)
        page.screenshot(path=str(OUT / "refine-zh-1440-now.png"))
        browser.close()

    print("PROBLEMS", problems)
    print("CONSOLE", console_errors)
    if problems or console_errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
