import { mount, unmount, type Component } from "svelte";
import { observeFigure, type FigureSignals } from "./mount-figure";
import { figureImports, type FigureImporter } from "./figures";

const FALLBACK_TEXT =
  "This interactive figure could not load. The article stands on its own " +
  "without it—reload the page or continue reading, then try again later.";

/**
 * Mount a Svelte component (or a readable fallback when importing failed)
 * into a figure's declared body slot.
 */
function figureMounter(target: HTMLElement) {
  return (component: unknown | null) => {
    if (component === null) {
      const fallback = document.createElement("p");
      fallback.className = "figure-fallback";
      fallback.setAttribute("role", "status");
      fallback.textContent = FALLBACK_TEXT;
      target.appendChild(fallback);
      return { unmount: () => fallback.remove() };
    }
    const instance = mount(component as Component, { target });
    return { unmount: () => unmount(instance) };
  };
}

function wireFigures(root: ParentNode = document) {
  for (const figure of root.querySelectorAll<HTMLElement>(
    "d-figure[data-figure]",
  )) {
    const id = figure.dataset.figure ?? "";
    const importer: FigureImporter | undefined = figureImports[id];
    const slot: HTMLElement =
      figure.querySelector<HTMLElement>("[data-figure-body]") ?? figure;
    observeFigure(
      figure as unknown as FigureSignals,
      () =>
        importer
          ? importer().then((module) => module.default)
          : Promise.reject(new Error(`Figure is not registered: ${id}`)),
      figureMounter(slot),
    );
  }
}

wireFigures();
