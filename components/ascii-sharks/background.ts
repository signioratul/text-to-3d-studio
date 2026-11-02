import { OceanEngine, type SharkKind, type SharkSpec } from "./index";

export type { SharkKind, SharkSpec };

export interface BackgroundOptions {
  /** Sharks to show. Kinds: classic, greathammer, mako. */
  sharks?: SharkSpec[];
  /** "dark" | "light" | "auto" (follows the system). Light mode inverts the canvas. */
  theme?: "dark" | "light" | "auto";
  /** Where to insert the canvas. Defaults to document.body (as first child). */
  parent?: HTMLElement;
}

const DEFAULT_SHARKS: SharkSpec[] = [
  { kind: "greathammer", size: 1 },
  { kind: "classic", size: 0.9 },
  { kind: "mako", size: 0.8 },
  { kind: "classic", size: 0.7 },
];

/** Adds the fixed full-screen shark ocean behind your page. Returns a handle with destroy() and setTheme(). */
export function mountSharkBackground(opts: BackgroundOptions = {}) {
  const canvas = document.createElement("canvas");
  canvas.className = "shark-bg";
  canvas.setAttribute("aria-hidden", "true");
  const parent = opts.parent ?? document.body;
  parent.insertBefore(canvas, parent.firstChild);

  const engine = new OceanEngine(canvas, opts.sharks ?? DEFAULT_SHARKS);

  const mq = matchMedia("(prefers-color-scheme: light)");
  let mode = opts.theme ?? "auto";
  const apply = () => {
    const t = mode === "auto" ? (mq.matches ? "light" : "dark") : mode;
    document.documentElement.setAttribute("data-theme", t);
  };
  mq.addEventListener("change", apply);
  apply();

  return {
    setTheme(m: "dark" | "light" | "auto") { mode = m; apply(); },
    destroy() { engine.destroy(); mq.removeEventListener("change", apply); canvas.remove(); },
  };
}
