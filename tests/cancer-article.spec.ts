import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const article = "/lab/cancer-classification/";

test("cancer article renders its date, equations, references, and aggregate download", async ({ page, request }) => {
  await page.goto(article);
  await expect(page.locator("d-title h1")).toHaveText("Rebuilding a cancer-classification experiment");
  await expect(page.locator("d-byline")).toContainText("Oct. 25, 2026");
  await expect(page.locator("d-math .katex-display")).toHaveCount(2);
  await expect(page.locator(".katex-error")).toHaveCount(0);
  await expect(page.locator("#references-list li")).toHaveCount(4);
  const response = await request.get("/articles/cancer-classification-results.json");
  expect(response.status()).toBe(200);
  expect((await response.json()).experiments).toHaveLength(8);
});

test("result explorer loads only on request and distinguishes OOF, final test, and row units", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto(article);
  const figure = page.locator('d-figure[data-figure="cancer-results"]');
  await figure.scrollIntoViewIfNeeded();
  const launch = figure.getByRole("button", { name: "Explore measured results" });
  await expect(launch).toBeVisible();
  expect(requests.filter((url) => url.includes("cancer-classification-results.json"))).toEqual([]);
  await launch.click();
  await expect(figure.getByText("88 predictions; accuracy 96.59%; AUROC 0.9973.", { exact: true })).toBeVisible();
  await figure.getByRole("combobox", { name: "Experiment", exact: true }).selectOption("S1");
  await figure.getByRole("combobox", { name: "Evaluation partition" }).selectOption("final");
  await expect(figure.getByText("22 predictions; accuracy 63.64%; AUROC 0.7188.", { exact: true })).toBeVisible();
  const confusion = figure.getByRole("table").first();
  await expect(confusion.getByRole("row").nth(1)).toContainText("7");
  await expect(confusion.getByRole("row").nth(2)).toContainText("7");
  await figure.getByRole("combobox", { name: "Experiment", exact: true }).selectOption("M1");
  await expect(figure.getByText(/does not measure generalization to unseen tumors/)).toBeVisible();
  await expect(figure.getByText(/704,081 predictions/)).toBeVisible();
});

test("cancer article is accessible and stays within mobile and desktop viewports", async ({ page }) => {
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(article);
    const figure = page.locator('d-figure[data-figure="cancer-results"]');
    await figure.scrollIntoViewIfNeeded();
    await figure.getByRole("button", { name: "Explore measured results" }).click();
    await expect(figure.getByRole("combobox", { name: "Experiment", exact: true })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/review/cancer-classification-${width}.png`, fullPage: true });
  }
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
});
