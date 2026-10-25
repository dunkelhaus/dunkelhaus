import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { articles } from "../lib/articles";

const root = new URL("../../", import.meta.url);
const results = JSON.parse(readFileSync(new URL("public/articles/cancer-classification-results.json", root), "utf8"));
const page = readFileSync(new URL("lab/cancer-classification/index.html", root), "utf8");

describe("published cancer result snapshot", () => {
  it("contains exactly eight real-data experiments and labels the two prediction units", () => {
    expect(results.experiments.map((run: { id: string }) => run.id)).toEqual(["M1", "M2", "M3", "M4", "M5", "S0", "S1", "S2"]);
    expect(results.scope).toContain("not synthetic fixtures");
    for (const run of results.experiments) {
      expect(run.unit).toBe(run.id === "M1" ? "mutation row" : "tumor");
      for (const partition of ["development", "final"] as const) {
        const { confusion, auroc } = run[partition];
        expect(confusion).toHaveLength(2);
        expect(confusion.every((row: number[]) => row.length === 2 && row.every((count) => Number.isInteger(count) && count >= 0))).toBe(true);
        expect(auroc).toBeGreaterThanOrEqual(0);
        expect(auroc).toBeLessThanOrEqual(1);
        const support = confusion.map((row: number[]) => row.reduce((a, b) => a + b, 0));
        expect(support).toEqual(run.id === "M1"
          ? partition === "development" ? [987903, 1828418] : [246976, 457105]
          : partition === "development" ? [34, 54] : [8, 14]);
      }
    }
  });

  it("keeps the missing-data and stopping limitations attached to measurements", () => {
    expect(results.source_audit.sample_missing_cells / results.source_audit.sample_total_cells).toBeCloseTo(0.9254847437542483);
    expect(results.source_audit.sample_missing_meaning).toContain("unverified");
    expect(results.source_audit.sample_refit_stopping).toContain("not convergence");
    expect(results.source_audit.sample_entry_validation_stopping).toEqual({ plateau: 44, iteration_cap: 46 });
    expect(results.source_audit.mutation_sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(results.source_audit.sample_sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("matches the registry and preserves template structure without placeholders or local CSS", () => {
    const metadata = JSON.parse(page.match(/<script type="text\/json">([\s\S]*?)<\/script>/)![1]);
    const registered = articles.find((article) => article.slug === "cancer-classification")!;
    expect(metadata.title).toBe(registered.title);
    expect(metadata.description).toBe(registered.description);
    expect(registered.published).toBe("2026-10-25");
    expect(metadata.published).toBe("Oct 25, 2026");
    expect(page).not.toContain("{{");
    expect(page).not.toMatch(/<style[\s>]/);
    expect(page).toContain('data-figure="cancer-results"');
    expect(page.indexOf("vendor/template.v2.js")).toBeLessThan(page.indexOf("/src/styles.css"));
    expect(page.indexOf("/src/styles.css")).toBeLessThan(page.indexOf("/src/article-theme.css"));
  });
});
