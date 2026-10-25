import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
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

  it("publishes measured operating points consistent with the reported metrics", () => {
    expect(results.schema_version).toBe(2);
    for (const run of results.experiments) {
      expect(run.provenance.sha256).toMatch(/^[a-f0-9]{64}$/);
      for (const key of ["development", "final"]) {
        const m = run[key];
        expect(m.roc.fpr.length).toBe(m.roc.tpr.length);
        let area = 0;
        for (let i = 1; i < m.roc.fpr.length; i++) {
          expect(m.roc.fpr[i]).toBeGreaterThanOrEqual(m.roc.fpr[i - 1]);
          expect(m.roc.tpr[i]).toBeGreaterThanOrEqual(m.roc.tpr[i - 1]);
          area += (m.roc.fpr[i] - m.roc.fpr[i - 1]) * (m.roc.tpr[i] + m.roc.tpr[i - 1]) / 2;
        }
        expect(area).toBeCloseTo(m.auroc, 12);
        expect(m.pr.recall.length).toBe(m.pr.precision.length);
        expect(m.pr.recall[0]).toBe(1);
        expect(m.pr.recall.at(-1)).toBe(0);
        expect(m.pr.precision[0]).toBeCloseTo(m.confusion[1].reduce((a: number, b: number) => a + b, 0) / m.n);
        for (let i = 1; i < m.pr.recall.length; i++) expect(m.pr.recall[i]).toBeLessThanOrEqual(m.pr.recall[i - 1]);
        for (const array of [m.roc.fpr, m.roc.tpr, m.pr.recall, m.pr.precision]) {
          expect(array.every((v: number) => Number.isFinite(v) && v >= 0 && v <= 1)).toBe(true);
        }
        expect((m.confusion[0][0] + m.confusion[1][1]) / m.n).toBeCloseTo(m.accuracy, 12);
        for (const [index, name] of ["lungad", "melanoma"].entries()) {
          const correct = m.confusion[index][index];
          expect(m.classes[name].precision).toBeCloseTo(correct / (m.confusion[0][index] + m.confusion[1][index]), 12);
          expect(m.classes[name].recall).toBeCloseTo(correct / m.classes[name].support, 12);
        }
      }
      expect(run.folds).toHaveLength(5);
      expect(run.folds.map((f: { fold: number }) => f.fold)).toEqual([0, 1, 2, 3, 4]);
      expect(run.folds.reduce((sum: number, f: { n_examples: number }) => sum + f.n_examples, 0)).toBe(run.development.n);
      if (run.id !== "S0") {
        const epochs = [...run.selection.best_epochs].sort((a: number, b: number) => a - b);
        expect(run.selection.final_epochs).toBe(epochs[2]);
        for (const fit of run.training) {
          expect(fit.best_epoch).toBeGreaterThan(0);
          expect(fit.best_epoch).toBeLessThanOrEqual(fit.history.val_loss.length);
        }
      }
    }
    expect(JSON.stringify(results)).not.toMatch(/lungad_\d|melanoma_\d|\/home\/dunkelhaus|"thresholds"/);
  });

  it("retains the six scope diagnostics and the measured MDS spectrum", () => {
    expect(results.imputation_scopes).toHaveLength(6);
    for (const scope of results.imputation_scopes) {
      expect(scope.selected_rank).toBe(5);
      expect(scope.stopping_reason).toBe("plateau");
      expect(scope.history).toHaveLength(scope.iterations);
      const best = [...scope.rank_scores].sort((a, b) => a.mean_rmse - b.mean_rmse)[0];
      expect(best.rank).toBe(scope.selected_rank);
      expect(scope.rank_scores.every((s: { rmse: number[] }) => s.rmse.length === 3)).toBe(true);
    }
    const eigenvalues: number[] = results.mds.spectrum;
    const retained = eigenvalues.slice(0, 10).reduce((sum, v) => sum + v, 0);
    const positive = eigenvalues.filter((v) => v > 0).reduce((sum, v) => sum + v, 0);
    expect(retained / positive).toBeCloseTo(results.mds.retained_positive_fraction, 12);
    expect(retained / positive).toBeCloseTo(0.6200850623522811, 10);
  });

  it("gives every experiment visible tables and five diagnostic instruments where available", () => {
    const ids = results.experiments.map((r: { id: string }) => r.id);
    for (const id of ids) {
      expect(page).toContain(`id="experiment-${id}"`);
      for (const chart of ["roc", "pr", "confusion", "folds", ...(id === "S0" ? [] : ["loss"])]) {
        const name = `${id}-${chart}`;
        expect(page).toContain(`id="figure-${name}"`);
        for (const suffix of chart === "confusion" ? ["-development", "-final"] : [""]) {
          expect(existsSync(new URL(`public/articles/cancer-classification/${name}${suffix}.svg`, root))).toBe(true);
        }
      }
    }
    expect(page.match(/<figure id=/g)).toHaveLength(43);
    const numbers = [...page.matchAll(/<b>Figure (\d+):<\/b>/g)].map((match) => Number(match[1]));
    expect(numbers).toEqual(Array.from({ length: 43 }, (_, index) => index + 1));
    expect(page).not.toMatch(/<select|Explore measured results|uv run|uv sync/);
    expect(page.match(/<d-math block/g)).toHaveLength(13);
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
    expect(page).not.toContain('data-figure="cancer-results"');
    expect(page.indexOf("vendor/template.v2.js")).toBeLessThan(page.indexOf("/src/styles.css"));
    expect(page.indexOf("/src/styles.css")).toBeLessThan(page.indexOf("/src/article-theme.css"));
  });
});
