import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Runtime, type Event } from "./runtime";
import { DEFAULT_REWARDS, START } from "./engine";
describe("simulation lifecycle", () => {
  let runtime: Runtime, events: Event[];
  beforeEach(() => {
    vi.useFakeTimers();
    events = [];
    runtime = new Runtime((e) => events.push(e));
    runtime.handle({ type: "init", session: 1 });
  });
  afterEach(() => {
    runtime.handle({ type: "dispose", session: runtime.session });
    vi.useRealTimers();
  });
  it("yields in bounded batches and pauses without background progress", () => {
    runtime.handle({ type: "train", session: 1 });
    vi.advanceTimersByTime(20);
    expect(runtime.learner.episodes).toBe(5);
    runtime.handle({ type: "pause", session: 1 });
    const n = events.length;
    vi.advanceTimersByTime(1000);
    expect(runtime.learner.episodes).toBe(5);
    expect(events).toHaveLength(n);
  });
  it("reset cancels pending training, replaces values, and rejects stale messages", () => {
    runtime.handle({ type: "train", session: 1 });
    vi.advanceTimersByTime(40);
    runtime.handle({
      type: "reset",
      session: 2,
      rewards: { ...DEFAULT_REWARDS },
      seed: 42,
    });
    runtime.handle({ type: "train", session: 1 });
    runtime.handle({ type: "reset", session: 1 });
    vi.advanceTimersByTime(2000);
    expect(runtime.session).toBe(2);
    expect(runtime.learner.episodes).toBe(0);
    expect(runtime.agent).toBe(START);
  });
  it("does not duplicate loops on repeated start and stops completely on disposal", () => {
    runtime.handle({ type: "train", session: 1 });
    runtime.handle({ type: "train", session: 1 });
    vi.advanceTimersByTime(20);
    expect(runtime.learner.episodes).toBe(5);
    runtime.handle({ type: "dispose", session: 1 });
    const n = events.length;
    vi.advanceTimersByTime(1000);
    runtime.handle({ type: "init", session: 2 });
    expect(events).toHaveLength(n);
  });
  it("steps the greedy policy without training and resets consistently", () => {
    runtime.handle({ type: "step", session: 1 });
    expect(runtime.steps).toBe(1);
    expect(runtime.learner.episodes).toBe(0);
    runtime.handle({ type: "reset", session: 2 });
    expect(runtime.steps).toBe(0);
    expect(runtime.agent).toBe(START);
  });
  it("rejects invalid configuration without replacing a valid learner", () => {
    runtime.handle({
      type: "reset",
      session: 2,
      rewards: { goal: -1, hazard: 0, step: 0 },
    });
    expect(runtime.session).toBe(1);
    expect(events.at(-1)?.type).toBe("error");
  });
});
