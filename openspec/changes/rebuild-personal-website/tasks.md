# Tasks

The specific RL playable and font are proposed defaults documented in design.md. This checklist authorizes no deployment; implementation begins through the apply workflow.

## 1. Svelte and Bun foundation

- [x] 1.1 Record the starting Git state and replace legacy React/CRA source and tooling with Svelte, TypeScript, and Vite while preserving OpenSpec and unrelated user files; verify the diff contains only intended replacements and no React runtime remains.
- [x] 1.2 Install and pin a compatible Bun/toolchain version, commit bun.lock, and provide dev/build/preview/check/test scripts; verify a frozen install in a clean temporary directory, type checking, and a production build all succeed.
- [x] 1.3 Configure Vitest and Playwright with a working production-preview fixture; verify a meaningful initial navigation browser check runs and document the exact commands in README.
- [x] 1.4 Remove obsolete brain/Draco/CRA demo assets and demo CNAME, add owner-specific static metadata, and confirm the preview output has no stale demo domain or CRA branding.

## 2. Personal content and visual system

- [x] 2.1 Create source-backed content records for the introduction, selected Comcast/Wells Fargo experience, and about/contact; verify statements against supplied documents, distinguish the personal playable, and use conservative year-level dates where sources conflict.
- [x] 2.2 Add graphite/cyan/magenta tokens inspired by big, accessible functional accent variants, licensed self-hosted typography, and a spacing scale; verify measured text/UI contrast and font fallback without an external font request.
- [x] 2.3 Build semantic responsive Home/Experience/Lab/About sections and fragment navigation; verify direct fragment access, browser back, keyboard focus, and nonoverlapping layouts at 360/768/1440px.
- [x] 2.4 Add verified GitHub/LinkedIn/email links and the supplied resume PDF, omitting public telephone and fabricated availability; verify link destinations and that the downloadable PDF is readable in production preview.
- [x] 2.5 Add browser checks for introduction, navigation, content links, horizontal overflow, and reduced motion; capture screenshots at all three review widths and document source/date handling in README.

## 3. Learning engine

- [x] 3.1 Implement a seeded bounded grid environment with start, goal, obstacles, hazards, configurable reward limits, and episode timeout; verify unit tests for valid transitions, terminal rewards, rejected inputs, reproducible reset, and timeout outcomes.
- [x] 3.2 Implement genuine tabular Q-learning with epsilon-greedy training and separate greedy evaluation; verify known action-value updates and unchanged values during evaluation, then demonstrate improvement over an untrained baseline under default rewards with fixed validation seeds and budget.
- [x] 3.3 Add worker messaging, bounded yielding batches, session IDs, pause/step/reset/dispose behavior, and stale-message rejection; verify lifecycle tests show prompt pausing, no stale reset updates, and no work after disposal.
- [x] 3.4 Document algorithm, reward semantics, default seed/budget, training versus evaluation, and learning limitations; verify the explanation agrees with executed engine behavior and measured results.

## 4. Playable interface and integration

- [x] 4.1 Build the explicit launch preview and dynamically imported lab component with loading/ready/running/paused/error states and retry; verify network requests show no experiment or worker chunk before launch and injected initialization failure leaves navigation usable.
- [x] 4.2 Build responsive Canvas visualization plus semantic reward controls, train/watch/pause/step/reset actions, objective and progress summaries; verify complete keyboard and touch operation, noncolor state cues, and reward changes reset previous learning with a visible message.
- [x] 4.3 Apply big-inspired cyan/magenta scientific geometry without sacrificing environment readability; verify screenshots distinguish agent, goal, hazard, obstacle, and selected states at mobile and desktop sizes.
- [x] 4.4 Integrate cleanup, visibility pausing, reduced motion, and unavailable-renderer fallback; verify browser checks for repeated launch/close, background pause, reset during training, and fallback with no page errors or duplicate loops.
- [x] 4.5 Add the accessible beginner explanation and optional technical details to the UI; verify displayed episode/return measurements correspond to worker data and educational scope is clearly stated.

## 5. Final integration and first-impression review

- [x] 5.1 Run frozen installation, type checks, all engine/lifecycle tests, production build, and browser flows together; record pass/fail outcomes and fix application failures before claiming readiness.
- [x] 5.2 Audit production-preview contrast, headings, focus, target sizes, reduced motion, asset loading, and mobile performance; report Lighthouse targets of at least 90 and initial compressed JS target below 100 KiB separately from mandatory behavioral results, investigating misses.
- [x] 5.3 Review and refine production screenshots and hover/focus/pressed/loading/error states at 360/768/1440px, focusing on the first viewport's clarity, spacing, typography, and big palette; deliver review artifacts and record remaining visual limitations rather than equating test passes with excellent design.
- [x] 5.4 Refresh README and cloud install/start instructions to the actually tested Bun/Svelte workflow, preserving unrelated configuration and removing obsolete React/OpenSSL requirements; exercise saved commands and report draft persistence separately from publication.
- [x] 5.5 Verify final tracked/untracked changes and package/output contents preserve user files and exclude unintended attachment publishing; provide implementation and validation results for review without deploying or choosing a production domain.
