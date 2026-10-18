/**
 * Figure mount helper.
 *
 * Article pages are plain HTML hosting distill's `d-figure` elements. Each
 * figure declares the component to mount through a registry (figures.ts): a
 * `data-figure` id maps to a `() => Promise<{ default: Component }>`. The
 * helper listens to the figure's own lifecycle signals and lazily imports and
 * mounts the registered component when the figure approaches the viewport.
 *
 * Design notes:
 * - Everything is dependency-free so it can be unit-tested in plain node with
 *   a fake signal source and a fake registry (see mount-figure.test.ts).
 * - Mounting passes `null` on import failure; the caller-side mounter renders
 *   a readable fallback in that case (readable failure is a spec requirement).
 * - By default a mounted figure stays mounted while offscreen so interactive
 *   state (a training run) survives scrolling. `unmountOnOffscreen` opts into
 *   unmount/remount cycles for stateless figures.
 */

export type FigureEventType = "ready" | "onscreen" | "offscreen";

export interface FigureSignals {
  addEventListener(type: FigureEventType, listener: () => void): void;
  removeEventListener(type: FigureEventType, listener: () => void): void;
}

export interface MountedFigure {
  unmount(): void;
}

export interface MountFigureOptions {
  /**
   * Unmount when the figure leaves the viewport (and remount when it returns).
   * Off by default: interactive figures keep their state while scrolled away.
   */
  unmountOnOffscreen?: boolean;
}

export type FigureMounter = (
  /** The imported component, or null when importing failed. */
  component: unknown | null,
) => MountedFigure;

/**
 * Observe a figure element and lazily import and mount its component.
 *
 * Wiring order on a real d-figure: the template fires `ready` when the figure
 * gets within ~two viewport heights and `onscreen`/`offscreen` as it actually
 * enters and leaves. `onscreen` is also treated as a mount fallback so a
 * missed `ready` (for example the element already visible before the article
 * script attaches) still mounts.
 *
 * @returns a dispose function removing all listeners.
 */
export function observeFigure(
  signals: FigureSignals,
  importFigure: () => Promise<unknown>,
  mount: FigureMounter,
  options: MountFigureOptions = {},
): () => void {
  let handle: MountedFigure | null = null;
  let importing = false;
  let remountRequested = false;
  let disposed = false;

  const unmountCurrent = () => {
    if (handle) {
      handle.unmount();
      handle = null;
    }
  };

  const mountComponent = (component: unknown | null) => {
    if (disposed || handle) return;
    try {
      handle = mount(component);
    } catch(error) {
      console.error("figure mount failed", error);
    }
  };

  const run = () => {
    if (disposed || importing || handle) return;
    importing = true;
    importFigure()
      .then((component) => {
        mountComponent(component);
      })
      .catch(() => {
        // Readable-failure contract: the mounter receives null and renders
        // an explanatory fallback instead of leaving an empty figure.
        mountComponent(null);
      })
      .finally(() => {
        importing = false;
        if (remountRequested && !disposed) {
          remountRequested = false;
          run();
        }
      });
  };

  const onOffscreen = () => {
    if (disposed || !options.unmountOnOffscreen) return;
    unmountCurrent();
  };

  const onScreen = () => {
    if (disposed) return;
    if (options.unmountOnOffscreen) {
      if (handle) return;
      if (importing) {
        // The import outlived the viewport visit: mount as soon as it lands.
        remountRequested = true;
        return;
      }
      run();
    } else {
      // Fallback to `ready`: mount as soon as actually seen if the ready
      // event happened before this script attached.
      run();
    }
  };

  signals.addEventListener("ready", run);
  signals.addEventListener("onscreen", onScreen);
  if (options.unmountOnOffscreen) {
    signals.addEventListener("offscreen", onOffscreen);
  }

  return () => {
    if (disposed) return;
    disposed = true;
    signals.removeEventListener("ready", run);
    signals.removeEventListener("onscreen", onScreen);
    if (options.unmountOnOffscreen) {
      signals.removeEventListener("offscreen", onOffscreen);
    }
  };
}
