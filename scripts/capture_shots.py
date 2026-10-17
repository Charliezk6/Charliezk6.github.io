"""Capture before/after screenshots and check overflow, console, and reduced motion."""
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parents[1] / "pr-shots"
OUT.mkdir(exist_ok=True)
WIDTHS = (1440, 1920, 390)
BEFORE = "http://127.0.0.1:8767/"
AFTER = "http://127.0.0.1:8766/"
problems = []
console_errors = []


def prepare(page, origin, lang):
    page.goto(origin, wait_until="domcontentloaded")
    page.evaluate("(value) => localStorage.setItem('kz-lang', value)", lang)
    page.goto(origin, wait_until="load")
    page.wait_for_timeout(600)


def shoot(page, origin, label):
    for lang in ("zh", "en"):
        prepare(page, origin, lang)
        for width in WIDTHS:
            height = 844 if width == 390 else 960
            page.set_viewport_size({"width": width, "height": height})
            page.wait_for_timeout(350)
            page.screenshot(path=str(OUT / f"{label}-{lang}-{width}.png"))
            box = page.evaluate(
                "() => ({scroll: document.documentElement.scrollWidth, view: window.innerWidth})"
            )
            if box["scroll"] > box["view"] + 1:
                problems.append(f"horizontal scroll {label} {lang} {width}: {box}")


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page()
        page.on("pageerror", lambda error: console_errors.append(f"pageerror: {error}"))
        page.on(
            "console",
            lambda message: console_errors.append(message.text) if message.type == "error" else None,
        )
        shoot(page, BEFORE, "before")
        shoot(page, AFTER, "after")

        page.set_viewport_size({"width": 1440, "height": 960})
        page.emulate_media(reduced_motion="reduce")
        prepare(page, AFTER, "zh")
        first = page.locator("#hero-plate").inner_text()
        page.wait_for_timeout(6200)
        second = page.locator("#hero-plate").inner_text()
        if first != second:
            problems.append(f"reduced motion still advanced: {first} -> {second}")

        page.emulate_media(reduced_motion="no-preference")
        prepare(page, AFTER, "zh")
        first = page.locator("#hero-plate").inner_text()
        page.wait_for_timeout(6200)
        second = page.locator("#hero-plate").inner_text()
        if first == second:
            problems.append(f"carousel did not advance: {first}")

        page.screenshot(path=str(OUT / "after-zh-1440-music.png"), full_page=False)
        page.locator("#music").scroll_into_view_if_needed()
        page.wait_for_timeout(400)
        page.screenshot(path=str(OUT / "after-zh-1440-music.png"))
        browser.close()

    print("PROBLEMS")
    for item in problems:
        print(item)
    print("CONSOLE")
    for item in console_errors:
        print(item)
    if problems or console_errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
