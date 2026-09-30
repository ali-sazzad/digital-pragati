import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// One test per automated case in ../TEST-CASES.md, named by its ID.
// The home page "/" is the plain HTML site from ../static-site/index.html,
// copied into public/ at build time and served through a rewrite. It has no
// React, so "ready" simply means the load event has fired and the network is quiet.

const mobile = { width: 360, height: 740 };
const desktop = { width: 1440, height: 900 };

// The page picks the Nepal market by default for visitors in Kathmandu's time
// zone; pin the zone so market tests start from the same state on any machine.
test.use({ timezoneId: "Australia/Sydney" });

async function load(page: Page, path = "/") {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

// Waits (bounded) until no CSS animation on the page is still in its finite run.
async function settleAnimations(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            document
              .getAnimations()
              // Scroll-driven animations (view timelines) never "finish"; only time-based ones matter here.
              .filter(
                (a) =>
                  a.timeline instanceof DocumentTimeline &&
                  a.playState === "running" &&
                  a.effect?.getTiming().iterations !== Infinity,
              ).length,
        ),
      { timeout: 5_000 },
    )
    .toBe(0);
}

const visibleText = (page: Page) => page.locator("body").innerText();

// 1. Hero & message

test("HERO-01 single specific H1", async ({ page }) => {
  await load(page);
  const h1 = page.locator("h1");
  await expect(h1).toHaveCount(1);
  const text = (await h1.innerText()).trim();
  const words = text.split(/\s+/).length;
  expect(words).toBeGreaterThanOrEqual(4);
  expect(words).toBeLessThanOrEqual(14);
  // Names the outcome (booked customers / enquiries) or the audience.
  expect(text).toMatch(/customer|enquir|business|booking|Nepal|Australia/i);
});

for (const size of [mobile, desktop]) {
  test(`HERO-02 primary CTA above the fold at ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await load(page);
    await settleAnimations(page);
    const cta = page.getByRole("link", { name: "Book a free strategy call" });
    await expect(cta).toHaveCount(1);
    // Inside the first screen and not hidden under the header or the mobile dock.
    const result = await cta.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return {
        inView: r.width > 0 && r.top >= 0 && r.bottom <= window.innerHeight,
        onTop: !!top && (top === el || el.contains(top)),
        box: `${Math.round(r.top)}..${Math.round(r.bottom)} of ${window.innerHeight}`,
      };
    });
    test.info().annotations.push({ type: "CTA", description: result.box });
    expect(result.inView).toBe(true);
    expect(result.onTop).toBe(true);
  });
}

test("HERO-03 both markets named in hero", async ({ page }) => {
  await load(page);
  const hero = page.locator(".hero");
  await expect(hero).toContainText("Australia");
  await expect(hero).toContainText("Nepal");
  await expect(hero.locator(".markets-line")).toBeInViewport();
});

test("HERO-04 no AI or automation language", async ({ page }) => {
  await load(page);
  // Check all human-readable text (including the hidden market panel and the
  // title), but not CSS or script source.
  const text = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    const out: string[] = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode())
      if (!n.parentElement?.closest("script, style")) out.push(n.textContent ?? "");
    return out.join(" ");
  });
  const meta = await page.locator("meta[content]").evaluateAll((els) => els.map((e) => e.getAttribute("content")).join(" "));
  for (const banned of [/AI-generated/i, /AI-powered/i, /template/i, /drag-and-drop/i, /push-button/i]) {
    expect(text).not.toMatch(banned);
    expect(meta).not.toMatch(banned);
  }
});

test("HERO-05 hero content visible at rest", async ({ page }) => {
  await load(page);
  // The entrance animation lasts about a second; allow it to finish, then
  // require every hero element carrying text to be clearly visible. (The studio
  // clocks panel deliberately sets 0.75-0.8 opacity on its captions; "hidden"
  // here means an effective opacity under 0.5.)
  await expect
    .poll(
      () =>
        page.locator(".hero *").evaluateAll((els) =>
          els
            .filter((el) => el.textContent?.trim())
            .filter((el) => {
              let o = 1;
              for (let a: Element | null = el; a; a = a.parentElement) o *= parseFloat(getComputedStyle(a).opacity);
              return o < 0.5;
            })
            .map((el) => el.className || el.tagName),
        ),
      { timeout: 5_000 },
    )
    .toEqual([]);
});

// 2. Trust & proof

test("TRUST-01 live self-measured performance", async ({ page }) => {
  await load(page);
  const lcp = page.locator("#m-lcp");
  const cls = page.locator("#m-cls");
  await expect(lcp).toHaveText(/^\d+\.\d{2} s$/);
  await expect(cls).toHaveText(/^\d+\.\d{3}$/);
  // The figures shown must be the browser's own PerformanceObserver readings
  // (once the count-up animation lands on them).
  const measured = () =>
    page.evaluate(
      () =>
        new Promise<{ lcp: number; cls: number }>((resolve) => {
          let l = 0;
          let c = 0;
          new PerformanceObserver((list) => (l = list.getEntries().at(-1)!.startTime)).observe({
            type: "largest-contentful-paint",
            buffered: true,
          });
          new PerformanceObserver((list) => {
            for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[])
              if (!e.hadRecentInput) c += e.value;
          }).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => resolve({ lcp: l, cls: c }), 50);
        }),
    );
  await expect
    .poll(
      async () => {
        const m = await measured();
        const shownLcp = parseFloat(await lcp.innerText());
        const shownCls = parseFloat(await cls.innerText());
        return Math.abs(shownLcp - m.lcp / 1000) <= 0.011 && Math.abs(shownCls - m.cls) <= 0.0011 && m.lcp > 0;
      },
      { timeout: 5_000 },
    )
    .toBe(true);
  await expect(page.locator("#m-kb")).toHaveText(/^\d+ KB$|^cached$/);
});

test("TRUST-02 no fabricated proof, concepts labelled", async ({ page }) => {
  await load(page);
  const text = await page.evaluate(() => document.body.textContent ?? "");
  expect(text).not.toMatch(/★|⭐|\d[\d,]*\+?\s*(happy\s+)?(clients|customers|reviews|projects)/i);
  expect(text).not.toMatch(/testimonial/i);
  expect(await page.locator('[itemprop="aggregateRating"], [itemtype*="Review"]').count()).toBe(0);
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.join(" ")).not.toMatch(/aggregateRating|"review"/i);
  const concepts = page.locator(".case");
  expect(await concepts.count()).toBeGreaterThan(0);
  for (const c of await concepts.all()) await expect(c.locator(".tag")).toHaveText("Concept");
});

test("TRUST-03 written performance pledge thresholds", async ({ page }) => {
  await load(page);
  const pledge = await page.locator("#pledge").innerText();
  for (const t of ["2.5 s", "0.1", "200 ms", "48 px"]) expect(pledge).toContain(t);
});

test("TRUST-04 Sydney and Kathmandu with live local times", async ({ page }) => {
  await load(page);
  const clocks = page.locator(".instrument .clocks");
  await expect(clocks).toContainText("Sydney");
  await expect(clocks).toContainText("Kathmandu");
  await expect(page.locator("#z-syd")).toHaveText(/AEST|AEDT/);
  await expect(clocks).toContainText("NPT");
  // The times shown are the real current times in each city (±1 minute).
  const minutes = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    return ((h % 24) * 60 + m) % 1440;
  };
  const nowIn = (timeZone: string) =>
    minutes(new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date()));
  for (const [id, zone] of [
    ["#t-syd", "Australia/Sydney"],
    ["#t-ktm", "Asia/Kathmandu"],
  ] as const) {
    const shown = page.locator(id);
    await expect(shown).toHaveText(/^\d{1,2}:\d{2}$/);
    const diff = Math.abs(minutes(await shown.innerText()) - nowIn(zone));
    expect(Math.min(diff, 1440 - diff)).toBeLessThanOrEqual(1);
  }
});

test("TRUST-05 structured business data", async ({ page }) => {
  await load(page);
  const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
  const data = JSON.parse(raw ?? "");
  expect(data["@type"]).toBe("ProfessionalService");
  const areas = data.areaServed.map((a: { name: string }) => a.name);
  expect(areas).toEqual(expect.arrayContaining(["Australia", "Nepal"]));
});

// 3. Conversion

test("CRO-01 short enquiry form, every field labelled", async ({ page }) => {
  await load(page);
  const form = page.locator("form#quote");
  const controls = form.locator("input:not([type=radio]):visible, textarea:visible, select:visible");
  const radioGroups = await form.locator("fieldset:has(input[type=radio])").count();
  const count = (await controls.count()) + radioGroups;
  test.info().annotations.push({ type: "Fields", description: String(count) });
  expect(count).toBeLessThanOrEqual(6);
  for (const c of await form.locator("input:visible, textarea:visible, select:visible").all()) {
    const id = await c.getAttribute("id");
    await expect(form.locator(`label[for="${id}"]`)).toHaveCount(1);
    expect((await form.locator(`label[for="${id}"]`).innerText()).trim()).not.toBe("");
  }
  for (const fs of await form.locator("fieldset").all()) await expect(fs.locator("legend")).not.toHaveText("");
});

test("CRO-02 market-aware quoting", async ({ page }) => {
  await load(page);
  const note = page.locator("#quote-note");
  await expect(note).toContainText("AUD");
  // From the form's own market choice.
  await page.getByRole("radio", { name: "Nepal" }).check();
  await expect(note).toContainText("NPR");
  for (const p of ["eSewa", "Khalti", "Fonepay"]) await expect(note).toContainText(p);
  await expect(note).not.toContainText("AUD");
  await page.getByRole("radio", { name: "Australia" }).check();
  await expect(note).toContainText("AUD");
  await expect(note).not.toContainText("NPR");
  // From the Markets section switch, which keeps the form in sync.
  const markets = page.locator("#markets");
  await markets.getByRole("button", { name: "Nepal" }).click();
  await expect(markets.getByRole("button", { name: "Nepal" })).toHaveAttribute("aria-pressed", "true");
  await expect(markets.locator('[data-panel="np"]')).toContainText("NPR");
  for (const p of ["eSewa", "Khalti", "Fonepay"]) await expect(markets.locator('[data-panel="np"]')).toContainText(p);
  await expect(page.locator("#mk-np")).toBeChecked();
  await expect(note).toContainText("NPR");
  await markets.getByRole("button", { name: "Australia" }).click();
  await expect(markets.locator('[data-panel="au"]')).toContainText("AUD");
  await expect(page.locator("#mk-au")).toBeChecked();
  await expect(note).toContainText("AUD");
});

test("CRO-03 inline validation moves focus to first error", async ({ page }) => {
  await load(page);
  let posted = false;
  page.on("request", (r) => {
    if (r.url().includes("/api/enquiry")) posted = true;
  });
  await page.getByRole("button", { name: "Request my strategy call" }).click();
  for (const id of ["#e-name", "#e-biz", "#e-contact"]) await expect(page.locator(id)).toBeVisible();
  await expect(page.locator("#f-name")).toBeFocused();
  for (const id of ["#f-name", "#f-biz", "#f-contact"]) await expect(page.locator(id)).toHaveAttribute("aria-invalid", "true");
  // Fixing the first field moves focus to the next error (submitted with Enter).
  await page.getByLabel("Your name").fill("Sita Sharma");
  await page.getByLabel("Your name").press("Enter");
  await expect(page.locator("#e-name")).toBeHidden();
  await expect(page.locator("#f-biz")).toBeFocused();
  expect(posted).toBe(false);
});

test("CRO-03 correcting a field doesn't move the submit button mid-click", async ({ page }) => {
  // Regression: hiding an error on blur collapsed the space above the button
  // between mousedown and mouseup, so a click near its bottom edge was lost.
  await load(page);
  const submit = page.getByRole("button", { name: "Request my strategy call" });
  await submit.click();
  await expect(page.locator("#e-name")).toBeVisible();
  await page.getByLabel("Your name").fill("Sita Sharma");
  await expect(page.locator("#e-name")).toBeHidden(); // cleared while typing, before the click
  const box = (await submit.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.85);
  await expect(page.locator("#f-biz")).toBeFocused();
});

test("CRO-04 success state with response-time promise", async ({ page }) => {
  await load(page);
  await page.getByLabel("Your name").fill("Sita Sharma");
  await page.getByLabel("Business name").fill("Himal Migration");
  await page.getByLabel("Email or phone").fill("sita@example.com");
  await page.locator("#f-need").selectOption("A new website");
  await page.locator("#f-msg").fill("Bring in visa consultation bookings.");
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().endsWith("/api/enquiry") && r.request().method() === "POST"),
    page.getByRole("button", { name: "Request my strategy call" }).click(),
  ]);
  expect(res.status()).toBe(200);
  const done = page.locator("#form-ok");
  await expect(done).toBeVisible();
  await expect(done).toContainText("Request received");
  await expect(done).toContainText("one business day");
  await expect(done).toBeFocused();
  await expect(page.locator("#form-fields")).toBeHidden();
});

test("CRO-05 no public prices", async ({ page }) => {
  await load(page);
  const text = await page.evaluate(() => document.body.textContent ?? "");
  expect(text).not.toMatch(/\$\s?\d|\b(AUD|NPR)\s?\d|\bRs\.?\s?\d|रु\.?\s?\d/);
});

test("CRO-06 persistent mobile CTA after scrolling", async ({ page }) => {
  await page.setViewportSize(mobile);
  await load(page);
  await page.evaluate(() => window.scrollTo(0, 3000));
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 3_000 }).toBeGreaterThan(1000);
  const cta = page.locator(".dock").getByRole("link", { name: "Get a quote" });
  await expect(cta).toBeInViewport();
  expect(await page.locator(".dock").evaluate((el) => getComputedStyle(el).position)).toBe("fixed");
  const box = (await cta.boundingBox())!;
  expect(box.y + box.height).toBeLessThanOrEqual(mobile.height);
});

test("CRO-07 at least three routes to contact", async ({ page }) => {
  await load(page);
  // Counted at desktop width, where the mobile dock is hidden.
  const routes = page.locator('a[href="#contact"]:visible, a[href$="#contact"]:visible, a[href^="mailto:"]:visible, a[href^="tel:"]:visible');
  expect(await routes.count()).toBeGreaterThanOrEqual(3);
});

// 4. Performance

// CPU throttling is relative to the host machine, so single runs swing by up to a
// second. Take the median of several cold loads, as Lighthouse-style audits do.
test("PERF-01 LCP within 2.0 s on throttled mobile (median of 3)", async ({ browser }) => {
  test.setTimeout(90_000);
  const samples: number[] = [];
  for (let i = 0; i < 3; i++) {
    const context = await browser.newContext({ viewport: mobile });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.goto("/", { waitUntil: "load" });
    samples.push(
      await page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            new PerformanceObserver((l) => resolve(l.getEntries().at(-1)!.startTime)).observe({
              type: "largest-contentful-paint",
              buffered: true,
            });
          }),
      ),
    );
    await context.close();
  }
  const median = [...samples].sort((a, b) => a - b)[1];
  test.info().annotations.push({ type: "LCP", description: `median ${Math.round(median)} ms of ${samples.map(Math.round).join(", ")}` });
  console.log(`PERF-01 LCP median ${Math.round(median)} ms of ${samples.map(Math.round).join(", ")}`);
  expect(median).toBeLessThanOrEqual(2000);
});

for (const size of [mobile, desktop]) {
  test(`PERF-02 CLS within 0.05 at ${size.width}px`, async ({ page }) => {
    await page.setViewportSize(size);
    await load(page);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1000); // let the meters count up and late shifts land
    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((l) => {
            for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[])
              if (!e.hadRecentInput) total += e.value;
          }).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => resolve(total), 200);
        }),
    );
    test.info().annotations.push({ type: "CLS", description: cls.toFixed(3) });
    expect(cls).toBeLessThanOrEqual(0.05);
  });
}

// The animation layer: libraries in /vendor/ plus /fx.js. PERF-07 budgets it separately.
const isFx = (url: string) => /^\/(vendor\/|fx\.js$)/.test(new URL(url).pathname);

test("PERF-03 HTML + CSS + JS weight within 90 KB", async ({ page }) => {
  // Counts every document, stylesheet and script body the page needs to render
  // (uncompressed), including the Google Fonts stylesheet; font files and the
  // animation layer, which loads after the load event, are excluded.
  const bodies: Promise<{ url: string; bytes: number }>[] = [];
  page.on("response", (r) => {
    const type = r.request().resourceType();
    if ((type === "document" || type === "stylesheet" || type === "script") && !isFx(r.url()))
      bodies.push(r.body().then((b) => ({ url: r.url(), bytes: b.length }), () => ({ url: r.url(), bytes: 0 })));
  });
  await load(page);
  const items = await Promise.all(bodies);
  const bytes = items.reduce((n, i) => n + i.bytes, 0);
  const detail = items.map((i) => `${new URL(i.url).pathname}=${(i.bytes / 1024).toFixed(1)}`).join(", ");
  test.info().annotations.push({ type: "Weight", description: `${(bytes / 1024).toFixed(1)} KB (${detail})` });
  expect(items.some((i) => i.bytes > 0)).toBe(true);
  expect(bytes).toBeLessThanOrEqual(90 * 1024);
});

test("PERF-07 animation layer loads after the page, within 140 KB", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const bodies: Promise<number>[] = [];
  page.on("response", (r) => {
    if (isFx(r.url())) bodies.push(r.body().then((b) => b.length, () => 0));
  });
  await load(page);
  await expect.poll(() => page.evaluate(() => "gsap" in window && "Motion" in window)).toBe(true);
  // Every file of the layer is fetched from this origin, and only once the load event has started.
  const files = await page.evaluate(() => {
    const loadAt = (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming).loadEventStart;
    return performance
      .getEntriesByType("resource")
      .filter((e) => /^\/(vendor\/|fx\.js$)/.test(new URL(e.name).pathname))
      .map((e) => ({ path: new URL(e.name).pathname, sameOrigin: new URL(e.name).origin === location.origin, afterLoad: e.startTime >= loadAt }));
  });
  const bytes = (await Promise.all(bodies)).reduce((n, b) => n + b, 0);
  test.info().annotations.push({ type: "Animation layer", description: `${(bytes / 1024).toFixed(1)} KB` });
  expect(files.map((f) => f.path).sort()).toEqual(["/fx.js", "/vendor/ScrollTrigger.min.js", "/vendor/gsap.min.js", "/vendor/motion.min.js"]);
  expect(files.every((f) => f.sameOrigin && f.afterLoad)).toBe(true);
  expect(bytes).toBeLessThanOrEqual(140 * 1024);

  // With reduced motion none of it is requested.
  const requested: string[] = [];
  page.on("request", (r) => {
    if (isFx(r.url())) requested.push(r.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.waitForLoadState("networkidle");
  expect(requested).toEqual([]);
});

test("PERF-04 no third-party scripts", async ({ page }) => {
  await load(page);
  const external = await page.locator("script[src]").evaluateAll((els) =>
    els.map((e) => (e as HTMLScriptElement).src).filter((src) => new URL(src).origin !== location.origin),
  );
  expect(external).toEqual([]);
});

test("PERF-05 fonts don't block text", async ({ page }) => {
  await load(page);
  const sheets = await page
    .locator('link[rel="stylesheet"][href*="fonts.googleapis.com"]')
    .evaluateAll((els) => els.map((e) => (e as HTMLLinkElement).href));
  expect(sheets.length).toBeGreaterThan(0);
  for (const href of sheets) expect(new URL(href).searchParams.get("display")).toBe("swap");
  await expect(page.locator('link[rel="preconnect"][href="https://fonts.googleapis.com"]')).toHaveCount(1);
  await expect(page.locator('link[rel="preconnect"][href="https://fonts.gstatic.com"][crossorigin]')).toHaveCount(1);
  // Every web font face the page declares swaps rather than hiding text.
  const displays = await page.evaluate(() => [...document.fonts].map((f) => f.display));
  if (displays.length) expect(displays.filter((d) => d !== "swap")).toEqual([]);
});

test("PERF-06 market toggle updates in under 100 ms", async ({ page }) => {
  await load(page);
  const ms = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const note = document.querySelector("#quote-note")!;
        const start = performance.now();
        new MutationObserver(() => resolve(performance.now() - start)).observe(note, {
          subtree: true,
          childList: true,
          characterData: true,
        });
        // Report a miss instead of hanging if the note never updates.
        setTimeout(() => resolve(Infinity), 2000);
        (document.querySelector('.switch button[data-market="np"]') as HTMLButtonElement).click();
      }),
  );
  test.info().annotations.push({ type: "Toggle", description: `${ms.toFixed(1)} ms` });
  expect(ms).toBeLessThan(100);
  await expect(page.locator("#quote-note")).toContainText("NPR");
  await expect(page.locator('[data-panel="np"]')).toBeVisible();
});

// 5. Accessibility

async function axeIssues(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  return violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}

for (const scheme of ["light", "dark"] as const) {
  test(`A11Y-01 axe scan has no serious or critical issues (${scheme})`, async ({ page }) => {
    // Reduced motion so the scan sees finished colours, not mid-fade ones.
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
    await load(page);
    expect(await axeIssues(page)).toEqual([]);
  });
}

test("A11Y-02 touch targets at least 48 px at 360 px", async ({ page }) => {
  await page.setViewportSize(mobile);
  await load(page);
  const small = await page
    .locator("a, button, summary, input:not([type=radio]):not([type=hidden]), textarea, select, .seg label, [tabindex]:not([tabindex='-1'])")
    .evaluateAll((els) =>
      els
        .filter((el) => {
          const s = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          // The skip link sits off-screen until focused (then it is 48 px tall).
          return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && !el.classList.contains("skip");
        })
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width < 47.5 || r.height < 47.5)
        .map(({ el, r }) => `${el.tagName.toLowerCase()} "${el.textContent?.trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`),
    );
  expect(small).toEqual([]);
});

test("A11Y-03 skip link first in tab order, focus ring visible", async ({ page }) => {
  await load(page);
  await page.keyboard.press("Tab");
  const skip = page.locator(":focus");
  await expect(skip).toHaveClass(/\bskip\b/);
  await expect(skip).toHaveAttribute("href", "#main");
  await expect(skip).toBeInViewport();
  const ring = (el: Element) => {
    const s = getComputedStyle(el);
    return s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2;
  };
  expect(await skip.evaluate(ring)).toBe(true);
  await page.keyboard.press("Tab");
  expect(await page.locator(":focus").evaluate(ring)).toBe(true);
});

test("A11Y-04 reduced motion disables animation", async ({ page }) => {
  // Sanity: with motion allowed the page does animate, so the check below isn't vacuous.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await load(page);
  expect(await page.evaluate(() => document.getAnimations().length)).toBeGreaterThan(0);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500); // past the meters' post-load update
  const state = await page.evaluate(() => ({
    animations: document.getAnimations().map((a) => (a as CSSAnimation).animationName ?? a.constructor.name),
    scroll: getComputedStyle(document.documentElement).scrollBehavior,
    heroAnim: getComputedStyle(document.querySelector(".hero-copy > *")!).animationName,
    // The meters skip their count-up (the live region never goes busy).
    busy: document.querySelector(".meters")!.getAttribute("aria-busy"),
  }));
  expect(state.animations).toEqual([]);
  expect(state.heroAnim).toBe("none");
  expect(state.scroll).toBe("auto");
  expect(state.busy).toBeNull();
  await page.locator('.switch button[data-market="np"]').click();
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test("A11Y-05 language attributes", async ({ page }) => {
  await load(page);
  await expect(page.locator("html")).toHaveAttribute("lang", "en-AU");
  const unmarked = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const out: string[] = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.parentElement?.closest("script, style")) continue;
      if (/[ऀ-ॿ]/.test(n.textContent ?? "") && !n.parentElement?.closest('[lang="ne"]')) out.push(n.textContent!.trim());
    }
    return out;
  });
  expect(unmarked).toEqual([]);
  expect(await page.locator('[lang="ne"]').count()).toBeGreaterThan(0);
});

test("A11Y-06 no skipped heading levels", async ({ page }) => {
  await load(page);
  const levels = await page.locator("h1, h2, h3, h4, h5, h6").evaluateAll((els) => els.map((e) => Number(e.tagName[1])));
  expect(levels[0]).toBe(1);
  for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
});

// 6. SEO

test("SEO-01 title length and keyword", async ({ page }) => {
  await load(page);
  const title = await page.title();
  test.info().annotations.push({ type: "Title", description: `${title.length} chars` });
  expect(title.length).toBeGreaterThanOrEqual(30);
  expect(title.length).toBeLessThanOrEqual(65);
  expect(title).toContain("Web Design");
});

test("SEO-02 meta description length", async ({ page }) => {
  await load(page);
  await expect(page.locator('meta[name="description"]')).toHaveCount(1);
  const desc = (await page.locator('meta[name="description"]').getAttribute("content")) ?? "";
  test.info().annotations.push({ type: "Description", description: `${desc.length} chars` });
  expect(desc.length).toBeGreaterThanOrEqual(120);
  expect(desc.length).toBeLessThanOrEqual(160);
});

test("SEO-03 canonical and Open Graph", async ({ page }) => {
  await load(page);
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveCount(1);
  expect(new URL((await canonical.getAttribute("href")) ?? "").protocol).toBe("https:");
  for (const p of ["og:title", "og:description", "og:type"]) {
    const meta = page.locator(`meta[property="${p}"]`);
    await expect(meta).toHaveCount(1);
    expect((await meta.getAttribute("content"))?.trim()).toBeTruthy();
  }
});

test("SEO-04 robots.txt references a valid sitemap", async ({ page, request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toMatch(/Sitemap:\s*\S+\/sitemap\.xml/);
  const xml = await (await request.get("/sitemap.xml")).text();
  await page.goto("about:blank");
  const ok = await page.evaluate((src) => {
    const doc = new DOMParser().parseFromString(src, "application/xml");
    return !doc.querySelector("parsererror") && doc.getElementsByTagName("url").length > 0;
  }, xml);
  expect(ok).toBe(true);
});

test("SEO-05 local keywords", async ({ page }) => {
  await load(page);
  const text = await visibleText(page);
  for (const k of ["Sydney", "Kathmandu", "Pokhara"]) expect(text).toContain(k);
});

// 7. PWA

test("PWA-01 manifest", async ({ page, request }) => {
  await load(page);
  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(href).toBeTruthy();
  const manifestUrl = new URL(href!, page.url());
  const res = await request.get(manifestUrl.href);
  expect(res.status()).toBe(200);
  const m = await res.json();
  expect(m.display).toBe("standalone");
  expect(m.start_url).toBeTruthy();
  expect(m.theme_color).toBeTruthy();
  const sizes = m.icons.map((i: { sizes: string }) => i.sizes);
  expect(sizes).toEqual(expect.arrayContaining(["192x192", "512x512"]));
  expect(m.icons.some((i: { purpose?: string }) => i.purpose?.includes("maskable"))).toBe(true);
  for (const icon of m.icons) {
    const img = await request.get(new URL(icon.src, manifestUrl).href);
    expect(img.status(), icon.src).toBe(200);
    expect(img.headers()["content-type"]).toContain("image/png");
  }
  // start_url resolves inside the site and serves the home page.
  const start = await request.get(new URL(m.start_url, manifestUrl).href);
  expect(start.status()).toBe(200);
});

async function installServiceWorker(page: Page) {
  await load(page);
  await page.evaluate(() =>
    Promise.race([navigator.serviceWorker.ready, new Promise((_, no) => setTimeout(() => no(new Error("SW not ready in 15 s")), 15_000))]),
  );
  await page.reload();
  await page.waitForLoadState("networkidle");
}

test("PWA-02 service worker controls the page on second load", async ({ page }) => {
  await installServiceWorker(page);
  expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  expect(await page.evaluate(() => navigator.serviceWorker.controller!.scriptURL)).toMatch(/\/sw\.js$/);
});

test("PWA-03 offline reload still renders home", async ({ page, context }) => {
  await installServiceWorker(page);
  await context.setOffline(true);
  try {
    await page.reload();
    await expect(page.locator("h1")).toContainText("Websites that turn visitors into");
    await expect(page.locator("#quote")).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});

test("PWA-03 offline unknown URL shows the offline page", async ({ page, context }) => {
  // static-site/sw.js precaches offline.html and serves it for uncached navigations.
  await installServiceWorker(page);
  await context.setOffline(true);
  try {
    await page.goto("/some-page-never-visited");
    await expect(page.locator("h1")).toContainText(/offline/i, { timeout: 3_000 });
  } finally {
    await context.setOffline(false);
  }
});

test("PWA-04 iOS icon and theme colour", async ({ page, request }) => {
  await load(page);
  const icon = page.locator('link[rel="apple-touch-icon"]');
  await expect(icon).not.toHaveCount(0);
  const res = await request.get(new URL((await icon.first().getAttribute("href"))!, page.url()).href);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("image/png");
  await expect(page.locator('meta[name="theme-color"]')).not.toHaveCount(0);
});

// The service worker must never answer or store the private admin page or the API.
test.describe(() => {
  test.use({ httpCredentials: { username: "admin", password: "test-admin" } });

  test("SW-01 service worker never caches /admin or /api", async ({ page }) => {
    await installServiceWorker(page);
    expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

    const adminNav = await page.goto("/admin");
    expect(adminNav!.status()).toBe(200);
    expect(adminNav!.fromServiceWorker()).toBe(false);

    await load(page);
    const statuses = await page.evaluate(async () => {
      const out: number[] = [];
      for (const url of ["/admin", "/api/enquiry", "/api/enquiry?x=1"]) out.push((await fetch(url)).status);
      return out;
    });
    expect(statuses[0]).toBe(200);
    await page.waitForTimeout(500); // cache writes are fire-and-forget in the worker

    const cached = await page.evaluate(async () => {
      const out: Record<string, string[]> = {};
      for (const name of await caches.keys())
        out[name] = (await (await caches.open(name)).keys()).map((r) => new URL(r.url).pathname + new URL(r.url).search);
      return out;
    });
    test.info().annotations.push({ type: "Caches", description: JSON.stringify(cached) });
    // The worker is caching (so the negative check means something)...
    expect(Object.keys(cached)).toContain("pragati-static-v5");
    expect(cached["pragati-static-v5"]).toEqual(expect.arrayContaining(["/", "/index.html", "/offline.html"]));
    // ...but nothing under /admin or /api.
    const leaked = Object.values(cached)
      .flat()
      .filter((p) => /^\/(admin|api)(\/|\?|$)/.test(p));
    expect(leaked).toEqual([]);
  });
});

test("CACHE-01 home page and service worker always revalidate (max-age=0)", async ({ request }) => {
  const home = await request.get("/");
  expect(home.status()).toBe(200);
  expect(home.headers()["cache-control"]).toContain("max-age=0");
  expect(await home.text()).toContain("Websites that turn visitors into");
  const sw = await request.get("/sw.js");
  expect(sw.headers()["cache-control"]).toContain("max-age=0");
});

// 8. Mobile & responsive

for (const width of [320, 360, 768, 1024, 1440]) {
  test(`MOB-01 no horizontal scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await load(page);
    const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(sw).toBeLessThanOrEqual(iw);
  });
}

test("MOB-02 bottom nav on mobile only", async ({ page }) => {
  await page.setViewportSize({ width: 767, height: 800 });
  await load(page);
  const dock = page.locator(".dock");
  await expect(dock).toBeVisible();
  expect(await dock.evaluate((el) => getComputedStyle(el).position)).toBe("fixed");
  await expect(dock).toBeInViewport();
  await page.setViewportSize({ width: 768, height: 800 });
  await expect(dock).toBeHidden();
});

test("MOB-03 body text at least 16 px on mobile", async ({ page }) => {
  // static-site/index.html raises all text to 16 px below 768 px.
  await page.setViewportSize(mobile);
  await load(page);
  const small = await page.locator("main p, main li, main dt, main dd, main td, main th, main label, main summary").evaluateAll((els) =>
    els
      .filter((el) => {
        // Skip hidden and visually-hidden (1 px clipped) elements.
        for (let a: Element | null = el; a; a = a.parentElement) {
          const r = a.getBoundingClientRect();
          if (r.width <= 1 || r.height <= 1) return false;
        }
        return parseFloat(getComputedStyle(el).fontSize) < 16;
      })
      .map((el) => `${el.className || el.tagName}: ${getComputedStyle(el).fontSize}`),
  );
  test.info().annotations.push({ type: "Small text", description: [...new Set(small)].join("; ") });
  expect(small).toEqual([]);
});

// 9. Themes & craft

test("UX-01 dark mode changes the page background and passes axe", async ({ page }) => {
  const bg = async () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await load(page);
  const light = await bg();
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  expect(await bg()).not.toBe(light);
  expect(await axeIssues(page)).toEqual([]);
});

test("UX-02 FAQ answers cost, timeline and ownership", async ({ page }) => {
  await load(page);
  const faq = (await page.locator(".faq summary").allInnerTexts()).join(" ").toLowerCase();
  expect(faq).toMatch(/cost/);
  expect(faq).toMatch(/how long|timeline/);
  expect(faq).toMatch(/own/);
  // Each answer is present and opens.
  const first = page.locator(".faq details").first();
  await first.locator("summary").click();
  await expect(first).toHaveAttribute("open", "");
  await expect(first.locator("p")).toBeVisible();
});

// 10. Backend: public enquiry API, database and admin list
// The test server runs with ENQUIRY_DELIVERY=log (no real email), a throwaway
// PGlite database, ADMIN_PASSWORD=test-admin and http://static.test allowed.

const admin = { Authorization: `Basic ${Buffer.from("admin:test-admin").toString("base64")}` };
const unique = (label: string) => `${label} ${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

test("API-01 static-site enquiry is saved and listed in admin", async ({ request }) => {
  const name = unique("Api Tester");
  const res = await request.post("/api/enquiry", {
    headers: { Origin: "http://static.test" },
    data: { name, business: "Lakeside Lodge", contact: "+977 980 000 0000", market: "np", need: "Online booking or payments" },
  });
  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ ok: true });
  expect(res.headers()["access-control-allow-origin"]).toBe("http://static.test");

  const page = await (await request.get("/admin", { headers: admin })).text();
  expect(page).toContain(name);
  expect(page).toContain("Online booking or payments");
});

test("API-02 invalid enquiry returns field errors", async ({ request }) => {
  const res = await request.post("/api/enquiry", { data: { name: "A", business: "", contact: "nope", market: "au" } });
  expect(res.status()).toBe(422);
  const body = await res.json();
  expect(Object.keys(body.errors).sort()).toEqual(["business", "contact", "name"]);
});

test("API-03 only allowed sites may post from a browser", async ({ request }) => {
  const ok = await request.fetch("/api/enquiry", { method: "OPTIONS", headers: { Origin: "http://static.test" } });
  expect(ok.status()).toBe(204);
  expect(ok.headers()["access-control-allow-origin"]).toBe("http://static.test");

  const blocked = await request.post("/api/enquiry", {
    headers: { Origin: "https://evil.example" },
    data: { name: "Someone", business: "Somewhere", contact: "a@b.co" },
  });
  expect(blocked.status()).toBe(403);
});

test("API-04 honeypot submissions are accepted but not stored", async ({ request }) => {
  const name = unique("Bot");
  const res = await request.post("/api/enquiry", { data: { name, business: "Spam Co", contact: "bot@spam.co", website: "http://spam" } });
  expect(res.status()).toBe(200);
  const page = await (await request.get("/admin", { headers: admin })).text();
  expect(page).not.toContain(name);
});

test("ADMIN-01 enquiries list needs the admin password", async ({ request }) => {
  const none = await request.get("/admin");
  expect(none.status()).toBe(401);
  expect(none.headers()["www-authenticate"]).toContain("Basic");
  const wrong = await request.get("/admin", {
    headers: { Authorization: `Basic ${Buffer.from("admin:guess").toString("base64")}` },
  });
  expect(wrong.status()).toBe(401);
  const right = await request.get("/admin", { headers: admin });
  expect(right.status()).toBe(200);
  expect(right.headers()["x-robots-tag"] ?? (await right.text())).toMatch(/noindex/);
});

test("ADMIN-02 home-page form enquiry is saved and listed as static site", async ({ page, request }) => {
  const name = unique("Form Tester");
  await load(page);
  await page.getByRole("radio", { name: "Nepal" }).check();
  await page.getByLabel("Your name").fill(name);
  await page.getByLabel("Business name").fill("Pokhara Lakeside Rooms");
  await page.getByLabel("Email or phone").fill("owner@example.com");
  await page.locator("#f-need").selectOption("Online booking or payments");
  await page.locator("#f-msg").fill("Direct booking enquiries with deposits.");
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().endsWith("/api/enquiry") && r.request().method() === "POST"),
    page.getByRole("button", { name: "Request my strategy call" }).click(),
  ]);
  // Posted to this site's own API, not the absolute data-endpoint.
  expect(new URL(res.url()).origin).toBe(new URL(page.url()).origin);
  expect(res.status()).toBe(200);
  await expect(page.locator("#form-ok")).toContainText("Kathmandu time");

  const html = await (await request.get("/admin", { headers: admin })).text();
  const row = html.split(/<tr\b/).find((chunk) => chunk.includes(name));
  expect(row, "enquiry row in /admin").toBeTruthy();
  expect(row).toContain("static site");
  expect(row).toContain("Pokhara Lakeside Rooms");
  expect(row).toContain("owner@example.com");
});
