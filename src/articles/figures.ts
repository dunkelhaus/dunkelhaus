/**
 * Per-article figure registry.
 *
 * Every interactive figure in an article page is a `<d-figure
 * data-figure="...">` whose id maps to a dynamic import of a Svelte
 * component. The dynamic boundary keeps each component (and the lab engine it
 * uses) out of the article page's initial payload until the figure is ready.
 */
export type FigureImporter = () => Promise<{ default: unknown }>;

export const figureImports: Record<string, FigureImporter> = {
  "reward-playground": () => import("./PlaygroundFigure.svelte"),
};
