import { describe, expect, it, vi } from "vitest";
import {
  observeFigure,
  type FigureEventType,
  type FigureSignals,
} from "./mount-figure";
import { figureImports } from "./figures";

const figureEventTypes: FigureEventType[] = ["ready", "onscreen", "offscreen"];

class FakeFigure implements FigureSignals {
  private listeners = new Map<FigureEventType, Set<() => void>>();

  addEventListener(type: FigureEventType, listener: () => void) {
    const set = this.listeners.get(type) ?? new Set();
    set.add(listener);
    this.listeners.set(type, set);
  }

  removeEventListener(type: FigureEventType, listener: () => void) {
    this.listeners.get(type)?.delete(listener);
  }

  fire(type: FigureEventType) {
    for (const listener of this.listeners.get(type) ?? []) listener();
  }

  listenerCount(type: FigureEventType) {
    return this.listeners.get(type)?.size ?? 0;
  }
}

function fakeRegistry() {
  const spy = vi.fn();
  const calls: Array<{ component: unknown }> = [];
  spy.mockImplementation((component: unknown) => {
    calls.push({ component });
    return { unmount: vi.fn() };
  });
  return Object.assign(spy, { calls });
}

describe("observeFigure", () => {
  it("mounts the imported component when the figure is ready", async () => {
    const figure = new FakeFigure();
    const registry = fakeRegistry();
    const component = { name: "ExampleFigure" };
    const importFigure = vi.fn().mockResolvedValue(component);

    observeFigure(figure, importFigure, registry);
    figure.fire("ready");
    await Promise.resolve();

    expect(importFigure).toHaveBeenCalledTimes(1);
    expect(registry).toHaveBeenCalledTimes(1);
    expect(registry.calls[0].component).toBe(component);
  });

  it("mounts null when importing fails so the caller can render a fallback", async () => {
    const figure = new FakeFigure();
    const registry = fakeRegistry();
    const importFigure = vi.fn().mockRejectedValue(new Error("offline"));

    observeFigure(figure, importFigure, registry);
    figure.fire("ready");
    await Promise.resolve();
    await Promise.resolve();

    expect(registry.calls).toHaveLength(1);
    expect(registry.calls[0].component).toBeNull();
  });

  it("imports once even if ready or onscreen fire repeatedly", async () => {
    const figure = new FakeFigure();
    const registry = fakeRegistry();
    const importFigure = vi.fn().mockResolvedValue({ name: "ExampleFigure" });

    observeFigure(figure, importFigure, registry);
    figure.fire("ready");
    figure.fire("ready");
    figure.fire("onscreen");
    await Promise.resolve();

    expect(importFigure).toHaveBeenCalledTimes(1);
  });

  it("uses onscreen as a mount fallback when ready never fires", async () => {
    const figure = new FakeFigure();
    const registry = fakeRegistry();
    const importFigure = vi.fn().mockResolvedValue({ name: "LateFigure" });

    observeFigure(figure, importFigure, registry);
    figure.fire("onscreen");
    await Promise.resolve();

    expect(registry.calls[0].component).toEqual({ name: "LateFigure" });
  });

  it("keeps mounted state while offscreen by default", async () => {
    const figure = new FakeFigure();
    const registry = fakeRegistry();
    const unmount = vi.fn();
    registry.mockImplementation(() => ({ unmount }));
    const importFigure = vi.fn().mockResolvedValue({ name: "Trained" });

    observeFigure(figure, importFigure, registry);
    figure.fire("ready");
    await Promise.resolve();
    figure.fire("offscreen");

    expect(unmount).not.toHaveBeenCalled();
    expect(importFigure).toHaveBeenCalledTimes(1);
  });

  it("unmounts on offscreen and remounts on return when opted in", async () => {
    const figure = new FakeFigure();
    const registry = fakeRegistry();
    const importFigure = vi.fn().mockResolvedValue({ name: "Static" });

    observeFigure(figure, importFigure, registry, { unmountOnOffscreen: true });
    figure.fire("onscreen");
    await Promise.resolve();
    await Promise.resolve();
    figure.fire("offscreen");
    figure.fire("onscreen");
    await Promise.resolve();
    await Promise.resolve();

    expect(importFigure).toHaveBeenCalledTimes(2);
    expect(registry.calls).toHaveLength(2);
  });

  it("stays inert after dispose", async () => {
    const figure = new FakeFigure();
    const registry = fakeRegistry();
    const importFigure = vi.fn().mockResolvedValue({ name: "Example" });

    const dispose = observeFigure(figure, importFigure, registry);
    expect(figure.listenerCount("ready")).toBe(1);
    expect(figure.listenerCount("onscreen")).toBe(1);
    expect(figure.listenerCount("offscreen")).toBe(0);

    dispose();
    figure.fire("ready");
    figure.fire("onscreen");
    await Promise.resolve();

    expect(figures_removed_after_dispose(figure)).toBe(true);
    expect(importFigure).not.toHaveBeenCalled();
  });
});

function figures_removed_after_dispose(figure: FakeFigure): boolean {
  for (const type of figureEventTypes) {
    if (figure.listenerCount(type) !== 0) return false;
  }
  return true;
}

describe("figure registry", () => {
  it("maps known figure ids to pending dynamic imports", () => {
    expect(Object.keys(figureImports)).toContain("reward-playground");
    for (const importer of Object.values(figureImports)) {
      expect(typeof importer).toBe("function");
      // The import is not invoked here: calling it would pull the component
      // graph into this node test. The dynamic-import shape is the contract.
    }
  });
});
