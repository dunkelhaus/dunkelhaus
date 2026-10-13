# The reward playground

This is genuine **tabular Q-learning**, implemented locally in an 8 × 6 educational navigation world. It is not a neural model, molecular simulation, or evidence of production RL performance.

The cyan circle A starts at S in the lower left; the magenta diamond G is the goal in the upper right. Gray crossed squares block movement; magenta triangles impose a hazard penalty. Walls and the default environment are fixed and solvable. No employer data is used.

## Learning and reward semantics

The agent has four actions: up, right, down, left. An off-grid move or a wall leaves its position unchanged. A normal transition earns the step reward. A hazard adds its penalty to that step reward. Entering the goal terminates the episode and earns only the goal reward. A 96-step cap terminates any looping policy as a timeout.

Defaults: goal +20, hazard −8, step −0.2, random seed 42. Each **Train agent** run adds 500 episodes. Goal is bounded to 1–50, hazard to −20–0, step to −2–1. Changing rewards or seed clears prior learning and pending work. Reset preserves the current settings and returns to the same initial seeded state.

The update is:

`Q(s,a) += 0.25 × [reward + 0.95 × max Q(next,a) − Q(s,a)]`

Terminal transitions have no future-value term. Exploration is epsilon-greedy, starting at 0.5 and decaying toward 0.08 as episodes accumulate. **Watch policy** and **Step** choose the best-valued action without updating Q. Equal values break ties in action order. Watching an untrained agent can therefore loop; the timeout is intentional and accurately reported.

Episode count and last training return come from executed training episodes. Policy steps, policy return, and goal/timeout outcomes come from evaluation. No timer pretends to be training progress. Positive step rewards can encourage avoiding termination; unusual settings need not converge to a goal-seeking policy.

## Execution and accessibility

The experiment and worker download only on explicit launch. Training runs five bounded episodes per batch, yielding between batches. A worker separates computation from UI. Session IDs prevent stale messages after reset. Pause cancels scheduled work; hiding the tab pauses it; close terminates the worker; a new launch starts fresh. Worker/renderer failures provide retry and preserve surrounding site content.

All actions are semantic buttons and inputs usable by keyboard and touch. Textual progress and symbol labels supplement the canvas and color cues. Under reduced motion, there is no decorative animation; Pause and Step allow deliberate exploration.

## Verification

Unit tests assert transitions, bounds, actual value updates, reproducible training, evaluation immutability, and learning improvement for seeds 42, 7, and 123 over a 500-episode budget. They also verify bounded batches, pause, reset, stale messages, duplicate starts, disposal, and invalid configuration. Browser tests exercise the complete production-built flow and renderer/worker failure behavior.
