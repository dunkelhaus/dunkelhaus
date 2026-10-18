#!/usr/bin/env node
/**
 * Vendor the distill article template and its third-party runtime assets.
 *
 * Distill's published template loads KaTeX and legacy polyfills from hardcoded
 * absolute `distill.pub` URLs. This script fetches the canonical published files,
 * rewrites those four asset URLs to page-relative paths under the vendored
 * `public/vendor/` tree (they resolve against depth-2 article pages at
 * `lab/<slug>/`), writes everything to `public/vendor/`, and fails loudly if the
 * upstream patch anchors drift. Content links to distill.pub inside the template
 * (branding defaults) are intentionally left untouched.
 *
 * Modes:
 * - default: fetch upstream, patch, write. Byte-stable so repeated runs are a no-op.
 * - upstream unreachable: if the vendored set already exists, verify it offline
 *   and continue with a warning; otherwise fail.
 *
 * Usage: bun scripts/vendor-distill.mjs [--quiet]
 */
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const vendorDir = path.join(repoRoot, "public", "vendor");
const QUIET = process.argv.includes("--quiet");

const UPSTREAM_BASE = "https://distill.pub";
const UPSTREAM_TEMPLATE_URL = `${UPSTREAM_BASE}/template.v2.js`;

/** Attributed header prepended to the vendored template bundle. */
const ATTRIBUTION_HEADER = `/*
 * Vendored copy of the distill article template for this site.
 * Upstream: https://distill.pub/template.v2.js (project: https://github.com/distillpub/template)
 * License: Apache-2.0 (Copyright 2018 The Distill Template Authors).
 * Local modifications:
 *  1. The template's hardcoded third-party asset URLs (KaTeX and polyfills on
 *     distill.pub/third-party/) are rewritten to page-relative paths under the
 *     vendored public/vendor/ tree so the site never fetches from distill.pub
 *     at runtime.
 *  2. Shadow-bound style colors (KaTeX ink, citation accents, hover-panel
 *     surface, abstract text) are parametrized with CSS custom properties
 *     (--article-*) that fall back to the upstream values, so a dark theme can
 *     restyle them from the cascade while unset properties keep the original
 *     light look.
 * Everything below this header is otherwise the unmodified bundle.
 */

`;

/** Theme parameter patches: custom property with upstream fallback, asserted counts. */
const COLOR_PARAMETERS = [
  {
    name: "KaTeX ink",
    upstream: `span.katex {\\n  -webkit-font-smoothing: antialiased;\\n  color: rgba(0, 0, 0, 0.8);`,
    vendored: `span.katex {\\n  -webkit-font-smoothing: antialiased;\\n  color: var(--article-math-color, rgba(0, 0, 0, 0.8));`,
    occurrences: 1,
  },
  {
    name: "citation accents",
    upstream: `color: hsla(206, 90%, 20%, 0.7);`,
    vendored: `color: var(--article-citation-color, hsla(206, 90%, 20%, 0.7));`,
    occurrences: 3,
  },
  {
    name: "hover panel surface",
    upstream: `border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: rgba(250, 250, 250, 0.95);`,
    vendored: `border: 1px solid var(--article-panel-border, rgba(0, 0, 0, 0.1));
  background-color: var(--article-surface-color, rgba(250, 250, 250, 0.95));`,
    occurrences: 1,
  },
  {
    name: "abstract text",
    upstream: `:host {
    font-size: 1.25rem;
    line-height: 1.6em;
    color: rgba(0, 0, 0, 0.7);`,
    vendored: `:host {
    font-size: 1.25rem;
    line-height: 1.6em;
    color: var(--article-muted-color, rgba(0, 0, 0, 0.7));`,
    occurrences: 1,
  },
  {
    name: "byline DOI placeholder",
    upstream: `<p><em>No DOI yet.</em></p>`,
    vendored: `<p hidden>DOI omitted.</p>`,
    occurrences: 1,
  },
];

/**
 * Patch anchors: each must occur EXACTLY ONCE in the upstream template.
 * If a fetch finds different strings, the patch is unsafe and we refuse.
 */
const PATCHES = [
  {
    name: "KaTeX JS URL",
    upstream: `const katexJSURL = 'https://distill.pub/third-party/katex/katex.min.js';`,
    vendored: `const katexJSURL = '../../vendor/katex/katex.min.js';`,
  },
  {
    name: "KaTeX CSS href",
    upstream: `href="https://distill.pub/third-party/katex/katex.min.css"`,
    vendored: `href="../../vendor/katex/katex.min.css"`,
  },
  {
    name: "webcomponents polyfill URL",
    upstream: `'https://distill.pub/third-party/polyfills/webcomponents-lite.js'`,
    vendored: `'../../vendor/polyfills/webcomponents-lite.js'`,
  },
  {
    name: "intersection-observer polyfill URL",
    upstream: `'https://distill.pub/third-party/polyfills/intersection-observer.js'`,
    vendored: `'../../vendor/polyfills/intersection-observer.js'`,
  },
];

/** Static third-party files fetched byte-for-byte from distill’s published dir. */
const THIRD_PARTY_FILES = [
  { url: "/third-party/katex/katex.min.js", out: "katex/katex.min.js" },
  { url: "/third-party/katex/katex.min.css", out: "katex/katex.min.css" },
  {
    url: "/third-party/polyfills/webcomponents-lite.js",
    out: "polyfills/webcomponents-lite.js",
  },
  {
    url: "/third-party/polyfills/intersection-observer.js",
    out: "polyfills/intersection-observer.js",
  },
];

const THIRD_PARTY_NOTICES = `# Vendored third-party assets

Fetched verbatim from distill.pub's published directories; not built from npm.
Served locally by this site; nothing here is fetched from distill.pub at runtime.

| File | Source | License |
| --- | --- | --- |
| template.v2.js | https://distill.pub/template.v2.js | Apache-2.0 (distill template) |
| katex/katex.min.js, katex/katex.min.css, katex/fonts/* | https://distill.pub/third-party/katex/ | MIT (KaTeX) |
| polyfills/webcomponents-lite.js | https://distill.pub/third-party/polyfills/webcomponents-lite.js | Apache-2.0 (webcomponents polyfill) |
| polyfills/intersection-observer.js | https://distill.pub/third-party/polyfills/intersection-observer.js | Apache-2.0 (W3C polyfill) |
`;

const log = (...args) => {
  if (!QUIET) console.log(...args);
};

function fail(message) {
  console.error(`vendor-distill: ${message}`);
  console.error(
    "vendor-distill: refusing to continue. Inspect the upstream change and update the patch anchors before vendoring.",
  );
  process.exit(1);
}

async function fetchOrThrow(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) fail(`fetch failed (${response.status} ${response.statusText}): ${url}`);
  return response;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/** Extract relative font paths referenced by a KaTeX CSS file, e.g. fonts/KaTeX_X.woff2 */
function extractFontPaths(css) {
  const paths = new Set();
  for (const match of css.matchAll(/url\(([^)]+)\)/g)) {
    const url = match[1].trim().replace(/^['"]|['"]$/g, "").split("#")[0];
    if (url.startsWith("fonts/")) paths.add(url);
  }
  return [...paths].sort();
}

/**
 * Apply the URL rewrites and theme parameter patches with strict anchors.
 */
function patchTemplate(source) {
  for (const { name, upstream, occurrences = 1 } of [...PATCHES, ...COLOR_PARAMETERS]) {
    const count = source.split(upstream).length - 1;
    if (count !== occurrences) {
      fail(
        `${name}: expected exactly ${occurrences} occurrence(s) of the anchor, found ${count}`,
      );
    }
  }
  let patched = source;
  for (const { name, upstream, vendored, occurrences = 1 } of [...PATCHES, ...COLOR_PARAMETERS]) {
    patched = patched.split(upstream).join(vendored);
    log(`  patched ${name} (${occurrences} site(s))`);
  }
  if (patched.includes("distill.pub/third-party")) {
    fail("patched template still references distill.pub/third-party/");
  }
  for (const { vendored, occurrences = 1 } of [...PATCHES, ...COLOR_PARAMETERS]) {
    const count = patched.split(vendored).length - 1;
    if (count !== occurrences) fail(`patched template lost the rewrite (${occurrences} expected): ${vendored.slice(0, 60)}`);
  }
  return patched;
}

/** Verify an already-committed vendor set without network access. */
async function verifyExistingVendorSet() {
  const templatePath = path.join(vendorDir, "template.v2.js");
  for (const file of [
    templatePath,
    ...THIRD_PARTY_FILES.map((f) => path.join(vendorDir, f.out)),
  ]) {
    if (!(await exists(file))) fail(`missing vendored file: ${path.relative(repoRoot, file)}`);
  }
  const vendored = await readFile(templatePath, "utf8");
  if (vendored.includes("distill.pub/third-party")) {
    fail("committed template.v2.js still references distill.pub/third-party/");
  }
  for (const { vendored: expected } of [...PATCHES, ...COLOR_PARAMETERS]) {
    if (!vendored.includes(expected)) {
      fail(`committed template.v2.js is missing the expected rewrite: ${expected.slice(0, 60)}`);
    }
  }
  log("  verified existing vendor set (offline)");
}

async function main() {
  log("vendor-distill: vendoring the distill template...");
  let source;
  try {
    source = await (await fetchOrThrow(UPSTREAM_TEMPLATE_URL)).text();
  } catch (error) {
    if (await exists(path.join(vendorDir, "template.v2.js"))) {
      console.warn(
        "vendor-distill: upstream unreachable, verifying the committed vendor set offline.",
      );
      await verifyExistingVendorSet();
      return;
    }
    fail(`upstream unreachable and no vendored template present: ${error}`);
  }

  for (const file of THIRD_PARTY_FILES) {
    const response = await fetchOrThrow(`${UPSTREAM_BASE}${file.url}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const outPath = path.join(vendorDir, file.out);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, bytes);
    log(`  fetched ${file.out} (${bytes.length} bytes)`);
  }

  const css = await readFile(path.join(vendorDir, "katex/katex.min.css"), "utf8");
  for (const fontPath of extractFontPaths(css)) {
    const response = await fetchOrThrow(`${UPSTREAM_BASE}/third-party/katex/${fontPath}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const outPath = path.join(vendorDir, "katex", fontPath);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, bytes);
    log(`  fetched katex/${fontPath} (${bytes.length} bytes)`);
  }

  await writeFile(path.join(vendorDir, "template.v2.js"), ATTRIBUTION_HEADER + patchTemplate(source));
  await writeFile(path.join(vendorDir, "THIRDPARTY_NOTICES.md"), THIRD_PARTY_NOTICES);
  log("vendor-distill: vendored template, third-party assets, and notices into public/vendor/");
}

await main();
