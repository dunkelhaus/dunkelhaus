import {
  Learner,
  START,
  SEED,
  BUDGET,
  MAX_STEPS,
  DEFAULT_REWARDS,
  transition,
  type Rewards,
  type Outcome,
} from "./engine";

export type Mode = "ready" | "training" | "watching" | "paused";
export type Snapshot = {
  session: number;
  mode: Mode;
  episodes: number;
  lastReturn: number;
  agent: number;
  path: number[];
  steps: number;
  outcome: Outcome;
  evaluationReturn: number;
};
export type Command = {
  session: number;
  type: "init" | "train" | "watch" | "pause" | "step" | "reset" | "dispose";
  rewards?: Rewards;
  seed?: number;
};
export type Event =
  | { type: "snapshot"; data: Snapshot }
  | { type: "error"; message: string; session: number };

export class Runtime {
  learner = new Learner();
  session = 0;
  mode: Mode = "ready";
  agent = START;
  path = [START];
  steps = 0;
  outcome: Outcome = null;
  evaluationReturn = 0;
  disposed = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private target = BUDGET;
  constructor(private emit: (event: Event) => void) {}
  snapshot(): Snapshot {
    return {
      session: this.session,
      mode: this.mode,
      episodes: this.learner.episodes,
      lastReturn: this.learner.lastReturn,
      agent: this.agent,
      path: [...this.path],
      steps: this.steps,
      outcome: this.outcome,
      evaluationReturn: this.evaluationReturn,
    };
  }
  private publish() {
    if (!this.disposed) this.emit({ type: "snapshot", data: this.snapshot() });
  }
  private stop() {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }
  private evaluationReset() {
    this.agent = START;
    this.path = [START];
    this.steps = 0;
    this.outcome = null;
    this.evaluationReturn = 0;
  }
  private stepEvaluation() {
    if (this.outcome) this.evaluationReset();
    const result = transition(
      this.agent,
      this.learner.greedy(this.agent),
      this.learner.rewards,
    );
    this.agent = result.state;
    this.path.push(this.agent);
    this.steps++;
    this.evaluationReturn += result.reward;
    this.outcome = result.terminal
      ? "goal"
      : this.steps >= MAX_STEPS
        ? "timeout"
        : null;
  }
  private tick = () => {
    this.timer = null;
    if (this.disposed) return;
    if (this.mode === "training") {
      for (let i = 0; i < 5 && this.learner.episodes < this.target; i++)
        this.learner.trainEpisode();
      this.path = [...this.learner.lastPath];
      this.agent = this.path[this.path.length - 1];
      if (this.learner.episodes >= this.target) {
        this.mode = "ready";
        this.evaluationReset();
      }
    } else if (this.mode === "watching") {
      this.stepEvaluation();
      if (this.outcome) this.mode = "paused";
    } else return;
    this.publish();
    if (this.mode === "training" || this.mode === "watching")
      this.timer = setTimeout(this.tick, this.mode === "training" ? 20 : 180);
  };
  handle(command: Command) {
    if (this.disposed) return;
    if (
      command.type !== "init" &&
      command.type !== "reset" &&
      command.session !== this.session
    )
      return;
    if (
      (command.type === "init" || command.type === "reset") &&
      command.session < this.session
    )
      return;
    try {
      switch (command.type) {
        case "init":
        case "reset": {
          const replacement = new Learner(
            command.rewards ?? { ...DEFAULT_REWARDS },
            command.seed ?? SEED,
          );
          this.stop();
          this.session = command.session;
          this.learner = replacement;
          this.mode = "ready";
          this.evaluationReset();
          break;
        }
        case "train":
          this.stop();
          this.evaluationReset();
          this.target = this.learner.episodes + BUDGET;
          this.mode = "training";
          this.timer = setTimeout(this.tick, 20);
          break;
        case "watch":
          this.stop();
          this.evaluationReset();
          this.mode = "watching";
          this.timer = setTimeout(this.tick, 180);
          break;
        case "pause":
          this.stop();
          this.mode = "paused";
          break;
        case "step":
          this.stop();
          this.mode = "paused";
          this.stepEvaluation();
          break;
        case "dispose":
          this.stop();
          this.disposed = true;
          return;
      }
      this.publish();
    } catch (e) {
      this.emit({
        type: "error",
        message: e instanceof Error ? e.message : "Experiment error",
        session: command.session,
      });
    }
  }
}
