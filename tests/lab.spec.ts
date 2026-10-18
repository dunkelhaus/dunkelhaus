import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("/lab/ lists each registry entry and its link resolves to a built page", async ({
  page,
  request,
}) => {
  await page.goto("/lab/");
  await expect(page).toHaveTitle(/Lab — Suraj Jena/);
  const entries = page.locator(".article-entry");
  await expect(entries).toHaveCount(1);
  const first = entries.first();
  await expect(first.getByRole("heading", { level: 2 })).toHaveText(
    "Designing rewards for a small learning agent",
  );
  await expect(first.locator("time")).toHaveAttribute("datetime", "2026-10-18");
  const href = await first
    .locator(".article-title a")
    .getAttribute("href");
  expect(href).toBe("./reward-design/");
  const response = await request.get("/lab/reward-design/");
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("Designing rewards");
});

test("/lab/ navigation is depth-correct and keyboard-accessible", async ({
  page,
}) => {
  await page.goto("/lab/");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav.getByRole("link", { name: /Lab/ })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await nav.getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/#about/);
  await page.goBack();
  await page.getByRole("footer").getByRole("link", { name: "GitHub" });
  await expect(
    page.getByRole("link", { name: "Suraj Jena home" }),
  ).toHaveAttribute("href", "../");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("/lab/reward-design/ renders the distill article chrome", async ({
  page,
}) => {
  await page.goto("/lab/reward-design/");
  await expect(page).toHaveTitle(
    /Designing rewards for a small learning agent — Suraj Jena/,
  );
  await expect(page.locator("d-title h1")).toHaveText(
    "Designing rewards for a small learning agent",
  );
  const byline = page.locator("d-byline .byline");
  await expect(byline.locator("> div:nth-child(2)")).toContainText(
    "Oct. 18, 2026",
  );
  // The byline shows only the publication date: author, affiliation, and DOI
  // columns are dropped by the theme layer.
  await expect(byline.locator(".authors-affiliations")).toBeHidden();
  await expect(byline.locator("> div:nth-child(3)")).toBeHidden();
  await expect(byline).toContainText("Published");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav.getByRole("link", { name: /Lab/ })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(
    page.getByRole("link", { name: "Suraj Jena home" }),
  ).toHaveAttribute("href", "../../");
});

test("/lab/reward-design/ typesets math and renders the citation apparatus", async ({
  page,
}) => {
  await page.goto("/lab/reward-design/");
  const inlineMath = page.locator("d-article .katex");
  await expect(inlineMath.first()).toBeVisible({ timeout: 15000 });
  const blockMath = page.locator("d-math .katex-display");
  await expect(blockMath).toHaveCount(1);
  const cites = page.locator("d-cite");
  await expect(cites).toHaveCount(2);
  for (const cite of await cites.all()) {
    await expect(cite.locator(".citation-number")).toBeVisible();
  }
  await expect(
    page.getByRole("heading", { name: "References", level: 3 }),
  ).toBeAttached();
  await expect(page.locator("#references-list li")).toHaveCount(2);
  const footnotes = page.locator("d-appendix d-footnote-list li");
  await expect(footnotes).toHaveCount(1);
  await expect(footnotes.first()).toContainText("Hyperparameters");
});

test("/lab/reward-design/ figures download only on launch and keep the controls working", async ({
  page,
}) => {
  const requested: string[] = [];
  page.on("request", (request) => requested.push(request.url()));
  await page.goto("/lab/reward-design/");

  // The gate mounts on the figure's ready/onscreen signals; a reader reaching
  // the figure is what triggers them.
  await page.locator("d-figure[data-figure]").scrollIntoViewIfNeeded();
  const launch = page.getByRole("button", { name: "Launch experiment" });
  await expect(launch).toBeVisible({ timeout: 15000 });

  // Nothing about the experiment (component, engine, worker) may be fetched
  // before the reader explicitly activates the figure.
  const experimentRequests = requested.filter((url) =>
    /simulation|worker|Playable/i.test(url),
  );
  expect(experimentRequests).toEqual([]);

  await launch.click();
  const trainButton = page.getByRole("button", { name: "Train agent" });
  await expect(trainButton).toBeVisible({ timeout: 10000 });
  const engineRequests = requested.filter((url) =>
    /Playable|worker/i.test(url),
  );
  expect(engineRequests.length).toBeGreaterThan(0);

  const episodes = page.getByTestId("episodes");
  await expect(episodes).toHaveText("0", { timeout: 10000 });
  await trainButton.click();
  await expect(episodes).not.toHaveText("0", { timeout: 10000 });

  await page.getByRole("button", { name: "Pause" }).click();
  await expect(
    page.getByText("Paused. Step through the policy or start a new training run."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Watch policy" }).click();
  await expect(
    page.getByText("Watching the learned policy. No learning happens during evaluation."),
  ).toBeVisible({ timeout: 10000 });

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(episodes).toHaveText("0", { timeout: 10000 });
  await expect(
    page.getByText("Learning cleared. Same seed, same starting world."),
  ).toBeVisible();
});

test("/lab/reward-design/ presents the shared dark identity at reference widths", async ({
  page,
}) => {
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/lab/reward-design/");
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const contrast = await page.evaluate(() => {
      const styles = getComputedStyle(document.querySelector("d-article")!);
      return {
        color: styles.color,
        background: getComputedStyle(document.documentElement).backgroundColor,
      };
    });
    expect(contrast.color).toBe("rgb(243, 243, 245)");
    expect(contrast.background).toBe("rgb(0, 0, 0)");
    await page.screenshot({
      path: `test-results/review/article-${width}.png`,
      fullPage: true,
    });
  }
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("/lab/ stays responsive at reference widths", async ({ page }) => {
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/lab/");
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const targets = await page
      .locator(".site-header a, .article-entry a, footer a")
      .evaluateAll((elements) =>
        elements.map((element) => {
          const rect = element.getBoundingClientRect();
          return { width: rect.width, height: rect.height, visible: rect.width > 0 };
        }),
      );
    expect(targets.filter((t) => t.visible).every((t) => t.height >= 44)).toBe(true);
    await page.screenshot({ path: `test-results/review/lab-${width}.png`, fullPage: true });
  }
});

test("figure training flow: real episodes, policy, settings, and relaunching", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/lab/reward-design/");
  await page.locator("d-figure[data-figure]").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Launch experiment" }).click();
  await expect(page.getByRole("button", { name: "Train agent" })).toBeEnabled();
  await page.getByRole("button", { name: "Train agent" }).click();
  await expect(page.getByTestId("episodes")).toHaveText("500", { timeout: 15000 });
  await page.getByRole("button", { name: "Watch policy" }).click();
  await expect(page.getByText("Goal reached.", { exact: false })).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: "Train agent" }).click();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const paused = await page.getByTestId("episodes").innerText();
  await page.waitForTimeout(100);
  await expect(page.getByTestId("episodes")).toHaveText(paused);
  await page.getByRole("spinbutton", { name: "Goal reward", exact: true }).fill("25");
  await page.getByRole("spinbutton", { name: "Goal reward", exact: true }).press("Tab");
  await expect(page.getByTestId("episodes")).toHaveText("0");
  await expect(page.getByText("Settings changed.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Step", exact: true }).click();
  await expect(page.getByText("Agent: column 1, row 5.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByText("Agent: column 1, row 6.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Close experiment" }).click();
  await page.getByRole("button", { name: "Launch experiment" }).click();
  await expect(page.getByTestId("episodes")).toHaveText("0");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
  await page.screenshot({ path: "test-results/review/playable-1440.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("figure keyboard controls, invalid input, visibility pause, and reset during training", async ({
  page,
}) => {
  await page.goto("/lab/reward-design/");
  await page.locator("d-figure[data-figure]").scrollIntoViewIfNeeded();
  const launch = page.getByRole("button", { name: "Launch experiment" });
  await launch.focus();
  await page.keyboard.press("Enter");
  const train = page.getByRole("button", { name: "Train agent" });
  await expect(train).toBeEnabled();
  await train.focus();
  await page.keyboard.press("Space");
  await expect(page.getByTestId("episodes")).not.toHaveText("0");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { value: true, configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.getByText("Paused while this tab", { exact: false })).toBeVisible();
  const n = await page.getByTestId("episodes").innerText();
  await page.waitForTimeout(100);
  await expect(page.getByTestId("episodes")).toHaveText(n);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { value: false, configurable: true });
  });
  const reward = page.getByRole("spinbutton", { name: "Goal reward", exact: true });
  await reward.focus();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("100");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("alert")).toContainText("Goal must be");
  await expect(train).toBeDisabled();
  await reward.fill("20");
  await reward.press("Tab");
  await train.focus();
  await page.keyboard.press("Space");
  const reset = page.getByRole("button", { name: "Reset", exact: true });
  await reset.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("episodes")).toHaveText("0");
  await page.waitForTimeout(100);
  await expect(page.getByTestId("episodes")).toHaveText("0");
  for (const name of ["Watch policy", "Pause", "Step", "Reset"]) {
    const b = page.getByRole("button", { name, exact: true });
    await b.focus();
    await expect(b).toBeFocused();
    await page.keyboard.press("Space");
  }
  await page.screenshot({ path: "test-results/review/controls-focus.png", fullPage: true });
});

test("figure touch controls and reduced motion at mobile width", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 800 }, hasTouch: true, isMobile: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/lab/reward-design/");
  await page.locator("d-figure[data-figure]").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Launch experiment" }).tap();
  await expect(page.getByRole("button", { name: "Train agent" })).toBeEnabled();
  await page.getByRole("button", { name: "Step", exact: true }).tap();
  await expect(page.getByText("Agent: column 1, row 5.", { exact: false })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const targets = await page
    .locator(".playable button,.playable input")
    .evaluateAll((elements) =>
      elements.map((e) => {
        const r = e.getBoundingClientRect();
        return { width: r.width, height: r.height, visible: r.width > 0 };
      }),
    );
  expect(targets.filter((t) => t.visible).every((t) => t.width >= 44 && t.height >= 44)).toBe(true);
  await page.screenshot({ path: "test-results/review/playable-360.png", fullPage: true });
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
  await context.close();
});

test("figure worker failure is recoverable and does not block the page", async ({ page }) => {
  await page.addInitScript(() => {
    const Original = window.Worker;
    let fail = true;
    window.Worker = class extends Original {
      constructor(url: string | URL, options?: WorkerOptions) {
        if (fail) {
          fail = false;
          throw new Error("Learning engine unavailable");
        }
        super(url, options);
      }
    };
  });
  await page.goto("/lab/reward-design/");
  await page.locator("d-figure[data-figure]").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Launch experiment" }).click();
  await expect(page.getByRole("alert")).toContainText("Learning engine unavailable");
  await page.screenshot({ path: "test-results/review/worker-error.png", fullPage: true });
  await page.getByRole("button", { name: "Retry experiment" }).click();
  await expect(page.getByRole("button", { name: "Train agent" })).toBeEnabled();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/#about/);
});

test("figure canvas failure gives a readable fallback with retry", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto("/lab/reward-design/");
  await page.locator("d-figure[data-figure]").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Launch experiment" }).click();
  await expect(page.getByRole("alert")).toContainText("Canvas rendering is unavailable");
  await expect(page.getByRole("button", { name: "Retry experiment" })).toBeVisible();
  await page.getByRole("button", { name: "Close experiment" }).click();
  await expect(page.getByRole("button", { name: "Launch experiment" })).toBeVisible();
});

test("figure module download failure is recoverable by relaunching", async ({ page }) => {
  await page.route("**/assets/Playable-*.js", (r) => r.abort());
  await page.goto("/lab/reward-design/");
  await page.locator("d-figure[data-figure]").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Launch experiment" }).click();
  await expect(page.getByRole("alert")).toContainText("could not be downloaded");
  await page.unroute("**/assets/Playable-*.js");
  await page.getByRole("button", { name: "Launch experiment" }).click();
  await expect(page.getByRole("button", { name: "Train agent" })).toBeEnabled();
});

test("figure shows a launch progress state while the module downloads", async ({ page }) => {
  await page.route("**/assets/Playable-*.js", async (r) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await r.continue();
  });
  await page.goto("/lab/reward-design/");
  await page.locator("d-figure[data-figure]").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Launch experiment" }).click();
  await expect(page.getByText("Preparing experiment…")).toBeVisible();
  await page.screenshot({ path: "test-results/review/loading.png", fullPage: true });
  await expect(page.getByRole("button", { name: "Train agent" })).toBeEnabled();
});
