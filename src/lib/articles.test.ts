import { describe, expect, it } from "vitest";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { articles } from "./articles";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const labDir = path.resolve(import.meta.dirname, "..", "..", "lab");

function articleDirectoriesOnDisk(): Set<string> {
  const listed = new Set<string>();
  try {
    for (const entry of readdirSync(labDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      try {
        if (statSync(path.join(labDir, entry.name, "index.html")).isFile()) {
          listed.add(entry.name);
        }
      } catch {
        // not a page directory
      }
    }
  } catch {
    // no lab/ directory yet
  }
  if (statSync(path.join(labDir, "index.html")).isFile()) {
    listed.add("__lab_index__");
  }
  return listed;
}

describe("article registry", () => {
  it("contains at least one article", () => {
    expect(articles.length).toBeGreaterThan(0);
  });

  it("uses well-formed, unique slugs", () => {
    const slugs = articles.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(SLUG);
    }
  });

  it("uses ISO publication dates and present, concise copy", () => {
    for (const article of articles) {
      expect(article.published).toMatch(ISO_DATE);
      expect(article.title.length).toBeGreaterThan(0);
      expect(article.title.length).toBeLessThanOrEqual(120);
      expect(article.description.length).toBeGreaterThan(0);
      expect(article.description.length).toBeLessThanOrEqual(300);
    }
  });
});

describe("registry and article pages agree on disk", () => {
  it("the lab index page exists as the lab landing page", () => {
    expect(articleDirectoriesOnDisk()).toContain("__lab_index__");
  });

  it("every registered article has its own lab page", () => {
    const listed = articleDirectoriesOnDisk();
    for (const slug of articles.map((a) => a.slug)) {
      expect(listed, `missing lab page for article: ${slug}`).toContain(slug);
    }
  });

  it("every article page on disk is registered in the lab index", () => {
    const registered = new Set(articles.map((a) => a.slug));
    for (const slug of articleDirectoriesOnDisk()) {
      if (slug === "__lab_index__") continue;
      expect(registered, `unregistered lab page on disk: ${slug}`).toContain(
        slug,
      );
    }
  });
});
