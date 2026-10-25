import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const article = "/lab/cancer-classification/";
const ids = ["M1", "M2", "M3", "M4", "M5", "S0", "S1", "S2"];

test("research article renders defined math, references and complete aggregate evidence", async ({ page, request }) => {
  await page.goto(article);
  await expect(page.locator("d-title h1")).toHaveText("Rebuilding a cancer-classification experiment");
  await expect(page.locator("d-byline")).toContainText("Oct. 25, 2026");
  await expect(page.locator("d-math .katex-display").first()).toBeVisible();
  await expect(page.locator("d-math .katex-display")).toHaveCount(13);
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
  await expect(page.locator("d-article figure")).toHaveCount(43);
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
    for (const name of ["M5-roc", "M5-pr", "M5-folds", "imputation-ranks", "S2-spectrum"]) {
      const figure = page.locator(`#figure-${name}`);
      await figure.scrollIntoViewIfNeeded();
      await expect.poll(() => figure.locator("img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      await figure.screenshot({ path: `test-results/review/cancer-${name}-${width}.png` });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator("#experiment-M5").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/review/cancer-reading-${width}.png` });
  }
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
});
