import { expect, test } from "@playwright/test";
import { articles } from "../src/lib/articles";

/**
 * Smoke pass over every built page.
 *
 * The page list is derived from the shared article registry plus the two
 * fixed chome pages, so a newly registered article is picked up without
 * touching this file. Every page must render its front-matter title, mount
 * every interactive figure it declares, and produce zero console errors and
 * zero failed requests.
 *
 * Payload segregation: the homepage requests no article, vendor, or KaTeX
 * assets — the template, math typesetting, and experiment download only on
 * the pages that declare them.
 */

interface PageSpec {
  path: string;
  heading: string;
  article?: boolean;
}

const pages: PageSpec[] = [
  { path: "/", heading: "Suraj Jena" },
  { path: "/lab/", heading: "Lab" },
  ...articles.map(
    (article): PageSpec => ({
      path: `/lab/${article.slug}/`,
      heading: article.title,
      article: true,
    }),
  ),
];

/** Requests that must never happen on the homepage. */
const experimentAssets = /\/vendor\/|katex|Playable|\/lab\/|articles/i;

test.describe("site smoke pass", () => {
  for (const spec of pages) {
    test(`${spec.path} renders and loads cleanly`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const failedRequests: string[] = [];
      const assetRequests: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => consoleErrors.push(error.message));
      page.on("requestfailed", (request) => {
        failedRequests.push(`${request.url()} :: ${request.failure()?.errorText}`);
      });
      page.on("request", (request) => {
        if (request.resourceType() !== "document") {
          assetRequests.push(request.url());
        }
      });

      const response = await page.goto(spec.path);
      expect(response?.status()).toBe(200);

      if (spec.article) {
        await expect(page.locator("d-title h1")).toHaveText(spec.heading);
        await expect(page.locator("d-math .katex-display").first()).toBeVisible();
      } else {
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(spec.heading);
      }

      // Every declared interactive figure mounts once it has been seen.
      const figures = page.locator("d-figure[data-figure]");
      const figureCount = await figures.count();
      for (let index = 0; index < figureCount; index++) {
        const figure = figures.nth(index);
        await figure.scrollIntoViewIfNeeded();
        await expect(
          figure.locator("[data-figure-body] > *"),
        ).toHaveCount(1, { timeout: 15000 });
      }

      if (spec.path === "/") {
        expect(
          assetRequests.filter((url) => experimentAssets.test(url)),
          "homepage must not request article, vendor, or KaTeX assets",
        ).toEqual([]);
      }

      if (spec.article) {
        expect(
          assetRequests.some((url) => url.includes("/vendor/template.v2.js")),
          "article loads its template",
        ).toBe(true);
        expect(
          assetRequests.some((url) => url.includes("/vendor/katex/")),
          "article loads KaTeX for math typesetting",
        ).toBe(true);
      }

      expect(failedRequests).toEqual([]);
      expect(consoleErrors).toEqual([]);
    });
  }
});
