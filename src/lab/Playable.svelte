<script lang="ts">
  import { onMount } from "svelte";
  import {
    WIDTH,
    HEIGHT,
    START,
    GOAL,
    WALLS,
    HAZARDS,
    DEFAULT_REWARDS,
    validateRewards,
    SEED,
    BUDGET,
  } from "./engine";
  import type { Command, Event, Snapshot } from "./runtime";
  let { onclose }: { onclose: () => void } = $props();
  let canvas: HTMLCanvasElement;
  let worker: Worker | null = null;
  let session = 0;
  let ctx: CanvasRenderingContext2D | null = null;
  let initTimeout: ReturnType<typeof setTimeout> | null = null;
  let snapshot = $state<Snapshot | null>(null);
  let error = $state("");
  let message = $state("Train the agent, then watch the path it has learned.");
  let goal = $state(DEFAULT_REWARDS.goal);
  let hazard = $state(DEFAULT_REWARDS.hazard);
  let stepReward = $state(DEFAULT_REWARDS.step);
  let seed = $state(SEED);
  let rewardsError = $state("");
  const labels = {
    ready: "Ready",
    training: "Training",
    watching: "Watching",
    paused: "Paused",
  };

  function dispose() {
    if (initTimeout) clearTimeout(initTimeout);
    worker?.postMessage({ type: "dispose", session });
    worker?.terminate();
    worker = null;
  }
  function send(type: Command["type"]) {
    worker?.postMessage({ type, session });
  }
  function reset(rewardChange = false) {
    try {
      const rewards = { goal, hazard, step: stepReward };
      validateRewards(rewards);
      if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295)
        throw new Error("Seed must be a whole number from 0 to 4294967295.");
      rewardsError = "";
      session++;
      worker?.postMessage({ type: "reset", session, rewards, seed });
      message = rewardChange
        ? "Settings changed. Previous learning cleared; train again to explore the new rewards."
        : "Learning cleared. Same seed, same starting world.";
    } catch (e) {
      rewardsError =
        e instanceof Error ? e.message : "Check the reward settings.";
    }
  }
  function initialize() {
    dispose();
    error = "";
    snapshot = null;
    session++;
    try {
      ctx = canvas.getContext("2d");
      if (!ctx)
        throw new Error(
          "Canvas rendering is unavailable in this browser. The rest of the site is still available.",
        );
      worker = new Worker(new URL("./simulation.worker.ts", import.meta.url), {
        type: "module",
      });
      worker.onmessage = ({ data }: MessageEvent<Event>) => {
        const id = data.type === "snapshot" ? data.data.session : data.session;
        if (id !== session) return;
        if (initTimeout) clearTimeout(initTimeout);
        if (data.type === "error") {
          error = data.message;
          dispose();
        } else snapshot = data.data;
      };
      worker.onerror = () => {
        error =
          "The learning engine could not start. Retry the experiment or explore the rest of the site.";
        dispose();
      };
      initTimeout = setTimeout(() => {
        error = "The learning engine took too long to respond. Please retry.";
        dispose();
      }, 8000);
      worker.postMessage({
        type: "init",
        session,
        seed,
        rewards: { goal, hazard, step: stepReward },
      });
    } catch (e) {
      error =
        e instanceof Error ? e.message : "The experiment could not start.";
      dispose();
    }
  }
  function draw(state: Snapshot) {
    if (!ctx) return;
    const c = ctx;
    const size = 64,
      px = 44,
      py = 39;
    const point = (s: number) => ({
      x: px + (s % WIDTH) * size + size / 2,
      y: py + Math.floor(s / WIDTH) * size + size / 2,
    });
    c.clearRect(0, 0, 600, 470);
    c.fillStyle = "#252525";
    c.fillRect(0, 0, 600, 470);
    c.font = "10px monospace";
    c.fillStyle = "#bcbcbc";
    c.textAlign = "left";
    c.fillText("ENVIRONMENT 01", 44, 24);
    c.textAlign = "right";
    c.fillText("8 × 6", 556, 24);
    for (let i = 0; i < WIDTH * HEIGHT; i++) {
      const p = point(i);
      c.strokeStyle = "#505050";
      c.lineWidth = 0.6;
      c.strokeRect(p.x - size / 2, p.y - size / 2, size, size);
      if (WALLS.has(i)) {
        c.fillStyle = "#444444";
        c.fillRect(p.x - 20, p.y - 20, 40, 40);
        c.strokeStyle = "#a1a1a1";
        c.beginPath();
        c.moveTo(p.x - 9, p.y - 9);
        c.lineTo(p.x + 9, p.y + 9);
        c.moveTo(p.x + 9, p.y - 9);
        c.lineTo(p.x - 9, p.y + 9);
        c.stroke();
      } else if (HAZARDS.has(i)) {
        c.fillStyle = "#c0008b";
        c.beginPath();
        c.moveTo(p.x, p.y - 19);
        c.lineTo(p.x + 20, p.y + 15);
        c.lineTo(p.x - 20, p.y + 15);
        c.closePath();
        c.fill();
        c.fillStyle = "#fff";
        c.font = "bold 15px sans-serif";
        c.textAlign = "center";
        c.fillText("!", p.x, p.y + 9);
      } else if (i === GOAL) {
        c.fillStyle = "#f072c6";
        c.beginPath();
        c.moveTo(p.x, p.y - 19);
        c.lineTo(p.x + 19, p.y);
        c.lineTo(p.x, p.y + 19);
        c.lineTo(p.x - 19, p.y);
        c.closePath();
        c.fill();
        c.fillStyle = "#252525";
        c.font = "bold 11px sans-serif";
        c.textAlign = "center";
        c.fillText("G", p.x, p.y + 4);
      } else if (i === START) {
        c.strokeStyle = "#5fdae1";
        c.beginPath();
        c.arc(p.x, p.y, 18, 0, Math.PI * 2);
        c.stroke();
        c.fillStyle = "#5fdae1";
        c.font = "11px sans-serif";
        c.textAlign = "center";
        c.fillText("S", p.x, p.y + 4);
      } else {
        c.fillStyle = "#8a8a8a";
        c.beginPath();
        c.arc(p.x, p.y, 2, 0, Math.PI * 2);
        c.fill();
      }
    }
    if (state.path.length > 1) {
      c.strokeStyle = "#5fdae1";
      c.globalAlpha = 0.65;
      c.lineWidth = 2;
      c.beginPath();
      state.path.forEach((s, i) => {
        const p = point(s);
        if (i === 0) c.moveTo(p.x, p.y);
        else c.lineTo(p.x, p.y);
      });
      c.stroke();
      c.globalAlpha = 1;
    }
    const p = point(state.agent);
    const gradient = c.createRadialGradient(p.x - 6, p.y - 7, 0, p.x, p.y, 16);
    gradient.addColorStop(0, "#a0f1f1");
    gradient.addColorStop(0.45, "#00b8c8");
    gradient.addColorStop(1, "#096b75");
    c.fillStyle = gradient;
    c.beginPath();
    c.arc(p.x, p.y, 16, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#12282a";
    c.font = "bold 10px sans-serif";
    c.textAlign = "center";
    c.fillText("A", p.x, p.y + 4);
    c.fillStyle = "#bcbcbc";
    c.font = "9px monospace";
    c.textAlign = "left";
    c.fillText("A · AGENT    S · START    G · GOAL", 44, 449);
  }
  $effect(() => {
    if (snapshot) draw(snapshot);
  });
  onMount(() => {
    initialize();
    const visibility = () => {
      if (document.hidden) {
        send("pause");
        message = "Paused while this tab is in the background.";
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      dispose();
    };
  });
</script>

<div class="playable">
  <div class="playable-top">
    <div>
      <span class="eyebrow">EXPERIMENT 001 / PERSONAL ML LAB</span>
      <h3>The reward playground</h3>
      <span class="playable-status" role="status"
        >{error ? "Error" : snapshot ? labels[snapshot.mode] : "Loading…"}</span
      >
    </div>
    <button class="button" onclick={onclose}
      >Close experiment <span aria-hidden="true">×</span></button
    >
  </div>
  {#if error}<div class="error-message" role="alert">
      <p>{error}</p>
      <button class="button" onclick={initialize}>Retry experiment</button>
    </div>{/if}
  <div class="playable-grid" hidden={!!error}>
    <div>
      <div class="canvas-wrap">
        <canvas
          bind:this={canvas}
          width="600"
          height="470"
          aria-label="Navigation world: cyan circle A is the agent, magenta diamond G is the goal, triangles are hazards, gray crossed squares are walls."
          >Use the textual progress summary and controls to explore this
          environment.</canvas
        >
        <div class="map-legend">
          <span><i class="cyan-dot"></i> A · Agent</span><span
            ><i class="pink-dot"></i> G · Goal</span
          ><span>△ Hazard</span><span>× Wall</span>
        </div>
      </div>
      <p class="progress-summary">
        {#if snapshot}Agent: column {(snapshot.agent % WIDTH) + 1}, row {Math.floor(
            snapshot.agent / WIDTH,
          ) + 1}. {snapshot.outcome === "goal"
            ? "Goal reached."
            : snapshot.outcome === "timeout"
              ? "Step limit reached: timeout."
              : "Reach G while avoiding costly hazards."}{/if}
      </p>
    </div>
    <div class="lab-controls">
      <h4>What should the agent value?</h4>
      <p>
        A goal is only half the story. Adjust the incentives, train for {BUDGET}
        episodes, then watch the learned policy.
      </p>
      <label class="reward-control"
        >Goal reward<input
          aria-label="Goal reward"
          type="number"
          min="1"
          max="50"
          step="1"
          bind:value={goal}
          onchange={() => reset(true)}
        /></label
      >
      <label class="reward-control"
        >Hazard penalty<input
          aria-label="Hazard penalty"
          type="number"
          min="-20"
          max="0"
          step="1"
          bind:value={hazard}
          onchange={() => reset(true)}
        /></label
      >
      <label class="reward-control"
        >Reward per step<input
          aria-label="Reward per step"
          type="number"
          min="-2"
          max="1"
          step="0.1"
          bind:value={stepReward}
          onchange={() => reset(true)}
        /></label
      >
      {#if rewardsError}<p role="alert">{rewardsError}</p>{/if}
      <div class="controls-row">
        <button
          class="button primary"
          disabled={!snapshot || !!rewardsError || snapshot.mode === "training"}
          onclick={() => {
            message =
              "Learning from trial and error. Each training run adds 500 episodes.";
            send("train");
          }}>Train agent</button
        ><button
          class="button"
          disabled={!snapshot || !!rewardsError}
          onclick={() => {
            message =
              "Watching the learned policy. No learning happens during evaluation.";
            send("watch");
          }}>Watch policy</button
        ><button
          class="button"
          disabled={!snapshot}
          onclick={() => {
            send("pause");
            message =
              "Paused. Step through the policy or start a new training run.";
          }}>Pause</button
        ><button
          class="button"
          disabled={!snapshot || !!rewardsError}
          onclick={() => {
            send("step");
            message = "One greedy policy step. Action values are unchanged.";
          }}>Step</button
        ><button class="button" disabled={!snapshot} onclick={() => reset()}
          >Reset</button
        >
      </div>
      <p role="status">{message}</p>
      <dl class="metrics">
        <div>
          <dt>Episodes</dt>
          <dd data-testid="episodes">{snapshot?.episodes ?? 0}</dd>
        </div>
        <div>
          <dt>Last train return</dt>
          <dd>{snapshot?.lastReturn.toFixed(1) ?? "0.0"}</dd>
        </div>
        <div>
          <dt>Policy steps</dt>
          <dd>{snapshot?.steps ?? 0}</dd>
        </div>
      </dl>
      {#if snapshot?.outcome}<p>
          Policy return: {snapshot.evaluationReturn.toFixed(1)} · {snapshot.outcome ===
          "goal"
            ? "Success"
            : "Timeout"}
        </p>{/if}
    </div>
  </div>
  <details class="technical">
    <summary>Under the surface <span aria-hidden="true">+</span></summary>
    <p>
      This is real tabular Q-learning in a small educational world. During
      training, the agent explores and updates action values from rewards.
      Watching uses its best-valued action without updating those values. A
      hazard adds its penalty to the step reward; the goal ends an episode with
      its goal reward. Episodes stop after 96 steps if the goal is not reached.
    </p>
    <p>
      Learning rate: 0.25 · Discount: 0.95 · Exploration: 0.5 decreasing toward
      0.08. Different incentives can encourage detours or loops; reaching the
      goal is not guaranteed. This demonstrates an idea, not real-world RL
      performance. Reduced motion? Use Pause and Step to explore at your own
      pace.
    </p>
    <label class="reward-control"
      >Random seed<input
        type="number"
        min="0"
        max="4294967295"
        step="1"
        bind:value={seed}
        onchange={() => reset(true)}
      /></label
    >
  </details>
</div>
