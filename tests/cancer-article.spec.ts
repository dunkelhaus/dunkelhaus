import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const article = "/lab/cancer-classification/";
const ids = ["M1", "M2", "M3", "M4", "M5", "S0", "S1", "S2"];

test("research article renders defined math, references and complete aggregate evidence", async ({ page, request }) => {
  await page.goto(article);
  await expect(page.locator("d-title h1")).toHaveText("Rebuilding a cancer-classification experiment");
  await expect(page.locator("d-byline")).toContainText("Oct. 25, 2026");
  await expect(page.locator("d-math .katex-display").first()).toBeVisible();
  const declaredMathCount = await page.locator("d-math[block]").count();
  expect(declaredMathCount).toBeGreaterThan(20);
  await expect(page.locator("d-math .katex-display")).toHaveCount(declaredMathCount);
  await expect(page.locator(".katex-error")).toHaveCount(0);
  await expect(page.locator("#references-list li")).toHaveCount(4);
  const response = await request.get("/articles/cancer-classification-results.json");
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.schema_version).toBe(2);
  expect(data.experiments).toHaveLength(8);
  expect(data.imputation_scopes).toHaveLength(6);
});

test("each experiment exposes curves, matrices, folds and tables without controls", async ({ page }) => {
  await page.goto(article);
  await expect(page.getByRole("combobox")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Explore measured results" })).toHaveCount(0);
  await expect(page.locator("d-article figure")).toHaveCount(46);
  for (const id of ids) {
    await expect(page.locator(`#experiment-${id}`)).toHaveCount(1);
    await expect(page.getByRole("table", { name: `${id}: separate development and final evaluations`, exact: true })).toHaveCount(1);
    await expect(page.getByRole("table", { name: `${id}: class metrics at the preselected threshold 0.5`, exact: true })).toHaveCount(1);
    for (const chart of ["roc", "pr", "confusion", "folds", ...(id === "S0" ? [] : ["loss"])]) {
      const figure = page.locator(`#figure-${id}-${chart}`);
      await figure.scrollIntoViewIfNeeded();
      const images = figure.locator("img");
      for (let i = 0; i < await images.count(); i++) {
        const image = images.nth(i);
        await image.scrollIntoViewIfNeeded();
        await expect(image).toBeVisible();
        await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
        const aspectError = await image.evaluate((img: HTMLImageElement) =>
          Math.abs(Number(img.getAttribute("width")) / Number(img.getAttribute("height")) / (img.naturalWidth / img.naturalHeight) - 1));
        expect(aspectError).toBeLessThan(0.01);
        await expect(image).toHaveAttribute("alt", new RegExp(id));
        await expect(figure.getByRole("link").nth(i)).toHaveAttribute("href", /\.svg$/);
      }
    }
  }
  await expect(page.locator("#imputation")).toBeAttached();
  await expect(page.locator("#figure-S2-spectrum img")).toBeAttached();
  expect(await page.locator("d-article").innerText()).not.toContain("uv run");
});

test("dataset heads, feature decisions and worked methods are visible beside their evidence", async ({ page, request }) => {
  await page.goto(article);
  for (const name of ["Mutation dataset head", "Sample dataset head", "Mutation feature dictionary", "Feature decisions", "Worked alternating imputation example", "Neural parameter counts"]) {
    const region = page.getByRole("region", { name, exact: true });
    await region.scrollIntoViewIfNeeded();
    await expect(region).toBeVisible();
    await expect(region.locator("tbody tr")).not.toHaveCount(0);
  }
  const response = await request.get("/articles/cancer-classification-eda.json");
  expect(response.ok()).toBe(true);
  const eda = await response.json();
  expect(eda.sample_development.observed_zero_cells).toBe(0);
  expect(eda.provenance.derived_after_experiments).toBe(true);
  for (const id of ["eda-burden", "eda-substitutions", "eda-support"]) {
    const image = page.locator(`#figure-${id} img`);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  }
});

test("primary evidence remains readable without article JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(article);
  for (const id of ids) {
    await expect(page.locator(`#experiment-${id}`)).toBeAttached();
    await expect(page.getByRole("table", { name: `${id}: separate development and final evaluations`, exact: true })).toBeAttached();
  }
  const matrix = page.locator("#figure-S1-confusion img").last();
  await matrix.scrollIntoViewIfNeeded();
  await expect(matrix).toBeVisible();
  await context.close();
});

test("article is accessible and responsive with visual evidence at all widths", async ({ page }) => {
  test.setTimeout(90000);
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(article);
    await expect(page.locator("d-math .katex-display").first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    for (const id of ["M1", "M5", "S1", "S2"]) {
      const figure = page.locator(`#figure-${id}-confusion`);
      await figure.scrollIntoViewIfNeeded();
      await expect.poll(() => figure.locator("img").evaluateAll((images: HTMLImageElement[]) => images.every((img) => img.complete && img.naturalWidth > 0))).toBe(true);
      await figure.screenshot({ path: `test-results/review/cancer-${id}-${width}.png` });
    }
    for (const name of ["eda-burden", "eda-substitutions", "eda-support", "M5-roc", "M5-pr", "M5-folds", "imputation-ranks", "S2-spectrum"]) {
      const figure = page.locator(`#figure-${name}`);
      await figure.scrollIntoViewIfNeeded();
      await expect.poll(() => figure.locator("img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      await figure.screenshot({ path: `test-results/review/cancer-${name}-${width}.png` });
    }
    for (const name of ["Mutation dataset head", "Sample dataset head", "Worked alternating imputation example", "Neural parameter counts"]) {
      const region = page.getByRole("region", { name, exact: true });
      await region.scrollIntoViewIfNeeded();
      await region.screenshot({ path: `test-results/review/cancer-${name.toLowerCase().replaceAll(" ", "-")}-${width}.png` });
    }
    for (const [name, heading] of [["neural-method", "What the neural networks learn"], ["alternating-method", "Alternate the low-rank fit and the missing-value update"]]) {
      await page.getByRole("heading", { name: heading, exact: true }).scrollIntoViewIfNeeded();
      await page.screenshot({ path: `test-results/review/cancer-${name}-${width}.png` });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator("#experiment-M5").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/review/cancer-reading-${width}.png` });
  }
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
});
