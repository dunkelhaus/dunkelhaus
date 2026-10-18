import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const root = import.meta.dirname;

function hasIndexPage(dir: string): boolean {
  try {
    return statSync(path.join(dir, "index.html")).isFile();
  } catch {
    return false;
  }
}

/**
 * Article pages are discovered from the filesystem: every lab/<slug>/index.html
 * becomes a build entry, so adding an article requires no build configuration edit.
 */
function labPageInputs(): Record<string, string> {
  const labDir = path.resolve(root, "lab");
  const inputs: Record<string, string> = {};
  try {
    for (const entry of readdirSync(labDir, { withFileTypes: true })) {
      if (entry.isDirectory() && hasIndexPage(path.join(labDir, entry.name))) {
        inputs[`lab/${entry.name}/index`] = path.join(labDir, entry.name, "index.html");
      }
    }
    if (hasIndexPage(labDir)) {
      inputs["lab/index"] = path.join(labDir, "index.html");
    }
  } catch {
    // no lab/ directory yet: no article entries
  }
  return inputs;
}

export default defineConfig({
  plugins: [svelte()],
  base: "./",
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(root, "index.html"),
        ...labPageInputs(),
      },
    },
  },
  test: { include: ["src/**/*.test.ts"] },
});
