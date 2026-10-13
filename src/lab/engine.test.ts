import { describe, expect, it } from "vitest";
import {
  Learner,
  transition,
  validateRewards,
  DEFAULT_REWARDS,
  GOAL,
  START,
  MAX_STEPS,
  BUDGET,
} from "./engine";

describe("navigation environment", () => {
  it("respects edges, walls, hazards, and terminal rewards", () => {
    expect(transition(0, 0, DEFAULT_REWARDS).state).toBe(0);
    expect(transition(9, 1, DEFAULT_REWARDS).state).toBe(9);
    expect(transition(20, 1, DEFAULT_REWARDS).reward).toBe(-8.2);
    expect(transition(6, 1, DEFAULT_REWARDS)).toEqual({
      state: GOAL,
      reward: 20,
      terminal: true,
    });
    expect(transition(GOAL, 0, DEFAULT_REWARDS).reward).toBe(0);
    expect(() => transition(-1, 0, DEFAULT_REWARDS)).toThrow();
    expect(() => transition(0, 4, DEFAULT_REWARDS)).toThrow();
  });
  it("rejects invalid and nonfinite rewards", () => {
    for (const r of [
      { goal: 0, hazard: -8, step: -0.2 },
      { goal: 20, hazard: 1, step: -0.2 },
      { goal: 20, hazard: -8, step: NaN },
    ])
      expect(() => validateRewards(r)).toThrow();
  });
  it("bounds an untrained looping policy and reports timeout", () => {
    const result = new Learner().evaluate();
    expect(result.outcome).toBe("timeout");
    expect(result.path).toHaveLength(MAX_STEPS + 1);
    expect(result.path[0]).toBe(START);
  });
});

describe("genuine Q-learning", () => {
  it("updates from actual rewards with no future value after termination", () => {
    const l = new Learner();
    l.q[GOAL * 4] = 100;
    l.update(6, 1, { state: GOAL, reward: 20, terminal: true });
    expect(l.q[25]).toBe(5);
    l.update(5, 1, { state: 6, reward: -0.2, terminal: false });
    expect(l.q[21]).toBeCloseTo(0.25 * (-0.2 + 0.95 * 5));
  });
  it("improves over an untrained baseline for fixed seeds without mutating evaluation values", () => {
    for (const seed of [42, 7, 123]) {
      const l = new Learner({ ...DEFAULT_REWARDS }, seed);
      const baseline = l.evaluate();
      for (let i = 0; i < BUDGET; i++) l.trainEpisode();
      const q = Array.from(l.q);
      const trained = l.evaluate();
      expect(trained.outcome).toBe("goal");
      expect(trained.total).toBeGreaterThan(baseline.total);
      expect(trained.path.length).toBeLessThan(baseline.path.length);
      expect(Array.from(l.q)).toEqual(q);
      expect(l.episodes).toBe(BUDGET);
      console.log(
        `seed ${seed}: baseline ${baseline.outcome} ${baseline.total.toFixed(1)}, trained ${trained.outcome} ${trained.total.toFixed(1)} in ${trained.path.length - 1} steps`,
      );
    }
  });
  it("reproduces training from identical seed and settings", () => {
    const a = new Learner(),
      b = new Learner();
    for (let i = 0; i < 50; i++) {
      a.trainEpisode();
      b.trainEpisode();
    }
    expect(a.q).toEqual(b.q);
    expect(a.lastPath).toEqual(b.lastPath);
  });
});
