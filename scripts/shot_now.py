from pathlib import Path
from playwright.sync_api import sync_playwright

out = Path("pr-shots")
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    for lang in ("zh", "en"):
        page.goto("http://127.0.0.1:8771/", wait_until="load")
        page.evaluate("(v) => localStorage.setItem('kz-lang', v)", lang)
        page.reload(wait_until="load")
        page.wait_for_timeout(1200)
        page.locator("#now").scroll_into_view_if_needed()
        page.wait_for_timeout(300)
        page.screenshot(path=str(out / f"refine-{lang}-1440-now.png"))
    page.evaluate("() => localStorage.setItem('kz-lang','zh')")
    page.reload(wait_until="load")
    page.locator("#computing").scroll_into_view_if_needed()
    page.locator(".doc-key").first.click()
    page.wait_for_selector(".doc-page img")
    page.wait_for_timeout(400)
    page.screenshot(path=str(out / "refine-zh-1440-doc.png"))
    browser.close()
