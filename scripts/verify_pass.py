"""Checks for readable PDFs, Shinning, saxophone links, and the hero line work."""
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parents[1] / "pr-shots"
OUT.mkdir(exist_ok=True)
ORIGIN = "http://127.0.0.1:8773/"
ZH = {
    "piano": "https://www.bilibili.com/video/BV1Z7411R7r2/",
    "flute": "https://www.bilibili.com/video/BV1Lp4y1h7Ay/?p=10",
    "drums": "https://www.bilibili.com/video/BV1jc411N7E2/",
    "sax": "https://www.bilibili.com/video/BV1FJ4m1K7hF/",
}
EN = {
    "piano": "https://www.youtube.com/watch?v=U3u4pQ4WKOk",
    "flute": "https://www.youtube.com/watch?v=KlYVMS5U4_E",
    "drums": "https://www.youtube.com/watch?v=IhA2AH_twA0",
    "sax": "https://www.youtube.com/watch?v=6IO74QV6wHY",
}
ARTIST = "https://music.163.com/#/artist?id=94272555"
problems = []
console_errors = []


def prepare(page, lang):
    page.goto(ORIGIN, wait_until="domcontentloaded")
    page.evaluate("(value) => localStorage.setItem('kz-lang', value)", lang)
    page.goto(ORIGIN, wait_until="load")
    page.wait_for_timeout(500)


def plate(page):
    return page.evaluate(
        """() => {
          const img = document.querySelector('.hero-slide.is-current');
          return img ? (img.currentSrc || img.src).split('/').pop() : '';
        }"""
    )


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page()
        page.on("pageerror", lambda error: console_errors.append(str(error)))
        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)

        for lang, expected in (("zh", ZH), ("en", EN)):
            prepare(page, lang)
            for width, height in ((1440, 900), (390, 844)):
                page.set_viewport_size({"width": width, "height": height})
                page.wait_for_timeout(280)
                page.screenshot(path=str(OUT / f"pass-{lang}-{width}-hero.png"))
                box = page.evaluate("() => ({scroll: document.documentElement.scrollWidth, view: innerWidth})")
                if box["scroll"] > box["view"] + 1:
                    problems.append(f"overflow {lang} {width} {box}")
                state = page.evaluate(
                    """() => {
                      const score = document.querySelector('.hero-score');
                      const marks = document.querySelector('.hero-marks');
                      const scoreBox = score.getBoundingClientRect();
                      const name = document.querySelector('h1').getBoundingClientRect();
                      const ink = getComputedStyle(score);
                      return {
                        score: !!score,
                        marks: !!marks,
                        scoreDisplay: ink.display,
                        scoreW: Math.round(scoreBox.width),
                        nameTop: Math.round(name.top),
                        scoreBottom: Math.round(scoreBox.bottom),
                      };
                    }"""
                )
                print(lang, width, state)
                if width >= 1440 and (not state["score"] or state["scoreDisplay"] == "none" or state["scoreW"] < 40):
                    problems.append(f"hero line missing {lang} {width} {state}")
                if not state["marks"]:
                    problems.append(f"hero marks missing {lang} {width}")

            now = page.evaluate(
                """() => {
                  const card = document.getElementById('now-playing');
                  const player = document.querySelector('.player-title');
                  return {
                    title: card.querySelector('.now-title').textContent.trim(),
                    meta: card.querySelector('.now-meta').textContent.trim(),
                    href: card.href,
                    player: player.textContent.trim(),
                  };
                }"""
            )
            print("now", lang, now)
            if now["title"] != "Shinning":
                problems.append(f"now title {lang} {now['title']}")
            if "Z.6" not in now["meta"] or "SHINNING" not in now["meta"]:
                problems.append(f"now meta {lang} {now['meta']}")
            if now["href"] != ARTIST:
                problems.append(f"now href {lang} {now['href']}")
            if now["player"] != "Desafinado":
                problems.append(f"player {lang} {now['player']}")

            links = page.evaluate(
                """() => [...document.querySelectorAll('[data-instrument]')].map((el) => ({
                  id: el.dataset.instrument,
                  href: el.href,
                  name: el.querySelector('h3').textContent.trim(),
                  alt: el.querySelector('img').alt,
                  src: el.querySelector('img').getAttribute('src'),
                  broken: el.querySelector('img').complete && el.querySelector('img').naturalWidth === 0,
                }))"""
            )
            print("links", lang, links)
            for item in links:
                if item["href"] != expected[item["id"]]:
                    problems.append(f"href {lang} {item['id']} {item['href']}")
                if item["broken"]:
                    problems.append(f"broken image {item['src']}")
                if lang == "zh" and "youtube.com" in item["href"]:
                    problems.append(f"zh youtube {item['href']}")
                if lang == "en" and "bilibili.com" in item["href"]:
                    problems.append(f"en bilibili {item['href']}")
            sax = next(item for item in links if item["id"] == "sax")
            if "saxphone.jpg" not in sax["src"]:
                problems.append(f"sax image {sax['src']}")
            if lang == "zh" and sax["name"] != "萨克斯":
                problems.append(f"sax name {sax['name']}")
            if lang == "en" and sax["name"] != "Saxophone":
                problems.append(f"sax name {sax['name']}")

            page.locator("#music").scroll_into_view_if_needed()
            page.wait_for_timeout(200)
            page.screenshot(path=str(OUT / f"pass-{lang}-music.png"), full_page=False)
            page.locator("#now").scroll_into_view_if_needed()
            page.wait_for_timeout(200)
            page.screenshot(path=str(OUT / f"pass-{lang}-now.png"), full_page=False)
            page.locator("#computing").scroll_into_view_if_needed()
            page.wait_for_timeout(300)
            page.screenshot(path=str(OUT / f"pass-{lang}-computing.png"), full_page=False)
            body = page.locator("body").inner_text()
            if "智审通" in body or "Zhishentong" in body or "tongyi.com" in page.content():
                problems.append(f"zhishentong still present {lang}")
            buttons = page.locator("#computing-list article").nth(2).locator(".doc-key")
            if buttons.count() != 1:
                problems.append(f"llm buttons {lang} {buttons.count()}")

        page.set_viewport_size({"width": 1440, "height": 900})
        prepare(page, "zh")
        page.locator("#computing-list .doc-key").first.click()
        page.wait_for_selector("#dossier[open] .doc-toolbar a")
        hrefs = page.eval_on_selector_all(
            "#dossier .doc-toolbar a",
            "els => els.map(el => ({text: el.textContent.trim(), href: el.getAttribute('href')}))",
        )
        print("dossier", hrefs)
        if not any(item["href"] == "assets/docs/apmcm-paper.pdf" for item in hrefs):
            problems.append(f"paper link {hrefs}")
        page.keyboard.press("Escape")

        page.locator("#computing-list article").nth(1).locator(".doc-key").first.click()
        page.wait_for_selector("#dossier[open] .doc-toolbar a")
        huashu = page.eval_on_selector_all(
            "#dossier .doc-toolbar a",
            "els => els.map(el => el.getAttribute('href'))",
        )
        print("huashu", huashu)
        if any("ebook" in href for href in huashu) or not any(href == "assets/docs/huashu-paper.pdf" for href in huashu):
            problems.append(f"huashu link {huashu}")
        page.keyboard.press("Escape")

        audio = page.evaluate(
            """() => {
              const audio = document.getElementById('site-audio');
              return {src: audio.getAttribute('src'), current: audio.currentSrc};
            }"""
        )
        print("audio", audio)
        if audio["src"] and "desafinado" not in audio["src"]:
            problems.append(f"audio src {audio}")

        first = plate(page)
        page.evaluate("() => window.scrollTo(0, 0)")
        page.wait_for_timeout(10000)
        later = plate(page)
        print("carousel", first, "->", later)
        if not first or first == later:
            problems.append(f"carousel did not advance {first} {later}")

        context = browser.new_context()
        reduced = context.new_page()
        reduced.emulate_media(reduced_motion="reduce")
        reduced.set_viewport_size({"width": 1440, "height": 900})
        reduced.goto(ORIGIN, wait_until="load")
        reduced.wait_for_timeout(400)
        motion = reduced.evaluate(
            """() => {
              const arc = document.querySelector('.hero-arc');
              const style = getComputedStyle(arc);
              return {name: style.animationName, offset: style.strokeDashoffset, marks: getComputedStyle(document.querySelector('.hero-marks')).animationName};
            }"""
        )
        print("reduced", motion)
        if motion["name"] != "none" or motion["marks"] != "none":
            problems.append(f"reduced motion still animates {motion}")
        if motion["offset"] not in ("0px", "0"):
            problems.append(f"reduced arc hidden {motion}")
        held = plate(reduced)
        reduced.wait_for_timeout(4000)
        if plate(reduced) != held:
            problems.append("carousel ran under reduced motion")
        reduced.screenshot(path=str(OUT / "pass-reduced-hero.png"))
        context.close()
        browser.close()

    print("console", console_errors)
    print("problems", problems)
    if console_errors or problems:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
