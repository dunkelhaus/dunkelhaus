export const WIDTH = 8;
export const HEIGHT = 6;
export const START = 40;
export const GOAL = 7;
export const MAX_STEPS = 96;
export const BUDGET = 500;
export const SEED = 42;
export const WALLS = new Set([10, 18, 26, 34, 29, 30]);
export const HAZARDS = new Set([21, 22, 37]);
export type Rewards = { goal: number; hazard: number; step: number };
export const DEFAULT_REWARDS: Rewards = { goal: 20, hazard: -8, step: -0.2 };
export type Transition = { state: number; reward: number; terminal: boolean };
export type Outcome = "goal" | "timeout" | null;

export function validateRewards(r: Rewards) {
  if (
    !Number.isFinite(r.goal) ||
    r.goal < 1 ||
    r.goal > 50 ||
    !Number.isFinite(r.hazard) ||
    r.hazard < -20 ||
    r.hazard > 0 ||
    !Number.isFinite(r.step) ||
    r.step < -2 ||
    r.step > 1
  ) {
    throw new Error("Goal must be 1–50, hazard −20–0, and step −2–1.");
  }
}

export function transition(
  state: number,
  action: number,
  rewards: Rewards,
): Transition {
  if (
    !Number.isInteger(state) ||
    state < 0 ||
    state >= WIDTH * HEIGHT ||
    WALLS.has(state) ||
    !Number.isInteger(action) ||
    action < 0 ||
    action > 3
  )
    throw new Error("Invalid state or action");
  if (state === GOAL) return { state, reward: 0, terminal: true };
  const x = state % WIDTH,
    y = Math.floor(state / WIDTH);
  const [dx, dy] = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ][action];
  const nx = x + dx,
    ny = y + dy;
  const candidate = ny * WIDTH + nx;
  const next =
    nx < 0 || nx >= WIDTH || ny < 0 || ny >= HEIGHT || WALLS.has(candidate)
      ? state
      : candidate;
  return {
    state: next,
    reward:
      next === GOAL
        ? rewards.goal
        : rewards.step + (HAZARDS.has(next) ? rewards.hazard : 0),
    terminal: next === GOAL,
  };
}

export function randomGenerator(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Learner {
  q = new Float64Array(WIDTH * HEIGHT * 4);
  episodes = 0;
  lastReturn = 0;
  lastOutcome: Outcome = null;
  lastPath: number[] = [START];
  private random: () => number;
  constructor(
    public rewards: Rewards = { ...DEFAULT_REWARDS },
    seed = SEED,
  ) {
    validateRewards(rewards);
    this.random = randomGenerator(seed);
  }
  greedy(state: number) {
    let best = 0;
    for (let a = 1; a < 4; a++)
      if (this.q[state * 4 + a] > this.q[state * 4 + best]) best = a;
    return best;
  }
  update(state: number, action: number, result: Transition) {
    const index = state * 4 + action;
    const future = result.terminal
      ? 0
      : this.q[result.state * 4 + this.greedy(result.state)];
    this.q[index] += 0.25 * (result.reward + 0.95 * future - this.q[index]);
  }
  trainEpisode() {
    let state = START,
      total = 0;
    const path = [START];
    this.lastOutcome = "timeout";
    const epsilon = Math.max(0.08, 0.5 * Math.exp(-this.episodes / 180));
    for (let i = 0; i < MAX_STEPS; i++) {
      const a =
        this.random() < epsilon
          ? Math.floor(this.random() * 4)
          : this.greedy(state);
      const result = transition(state, a, this.rewards);
      this.update(state, a, result);
      total += result.reward;
      state = result.state;
      path.push(state);
      if (result.terminal) {
        this.lastOutcome = "goal";
        break;
      }
    }
    this.episodes++;
    this.lastReturn = total;
    this.lastPath = path;
  }
  evaluate() {
    let state = START,
      total = 0;
    const path = [START];
    let outcome: Outcome = "timeout";
    for (let i = 0; i < MAX_STEPS; i++) {
      const result = transition(state, this.greedy(state), this.rewards);
      state = result.state;
      total += result.reward;
      path.push(state);
      if (result.terminal) {
        outcome = "goal";
        break;
      }
    }
    return { path, total, outcome };
  }
}
