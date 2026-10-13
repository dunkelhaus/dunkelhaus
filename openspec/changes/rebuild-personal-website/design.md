# Design

## Context

See proposal.md for motivation and the three capability specs for behavior. The current repository is a React 16/CRA 3 scene with absolute-positioned CSS, a Draco-compressed brain asset, default CRA metadata, and a demo CNAME. It has no existing content architecture, tests, durable specs, or implemented article-hover system. The owner explicitly permits discarding legacy application code. Preserve planning artifacts and unrelated user files.

Confirmed: Svelte + TypeScript + Vite + Bun; a straightforward professional/personal website; professional experience plus a new ML playable; high design quality; **big**, the second image, is the primary theme reference. The exact playable and typography below are proposed design defaults, not previously approved selections.

## Goals / Non-Goals

**Goals:**
- A coherent static site with a readable first screen and independently loaded experiment.
- A compact architecture that supports future canvas or 3D playables without coupling them to page layout.
- Reviewable visual quality on mobile and desktop, with behavior and learning verified independently.

**Non-Goals:**
- Accounts, backend services, paid APIs, analytics, employer data, live inference endpoints, or live training of large neural networks.
- Recreating the brain navigation concept, a molecular physics simulation, an Apple clone, or multiple launch experiments.
- An empty blog, fabricated personal projects, automatic deployment, or production-domain selection.

## Decisions

### 1. One frontend toolchain

Use current stable Svelte with TypeScript and Vite, Bun for package installation and scripts, and a committed bun.lock. Pin the tested Bun version and compatible dependency versions during implementation. Provide dev, build, preview, check, unit-test, and browser-test scripts. Use Svelte's own transitions and CSS before adding animation packages. Use Vitest for deterministic simulation tests and Playwright for browser behavior. Alternatives: Astro adds another layer for a small site; React/Vue are viable but no longer gain a migration advantage; Bun's test runner alone does not replace browser/Svelte validation.

### 2. Small content-first site

Launch as one page with semantic Home, Experience, Lab, and About/Contact sections and fragment links. Separate content records from presentation so later case-study pages can be added without rewriting layout. Avoid a router until distinct pages are needed. Use a self-hosted licensed sans-serif font (Inter is the proposed default), a restrained monospace for experiment measurements, and font fallbacks. Use document-flow layouts rather than absolute positioning for content.

Content sources available in the onboarding workspace:
- `/workspace/attachments/45bbacdd-aac1-4514-baab-6c6d3ea4ce0a/07162025.tex`
- `/workspace/attachments/96e3da80-be58-4381-bfab-8b7ff4e73cf1/resume-10.pdf`
- `/workspace/attachments/42401f41-410f-4652-a447-c244246ea6bf/Profile.pdf`
- `/workspace/attachments/2189f013-7a71-4152-be74-a5cc256803f7/Music_Taste_and_Website_Theme_Reference.md`

The PDF and LaTeX resume agree on key recent roles; LinkedIn adds AI-tooling work and earlier research. Select Comcast smart-home ML, event-driven systems/time-series design, and Wells Fargo intent classification as initial experience stories. Do not fabricate quantitative improvement or public employer project links. Wells Fargo's end month and Persistent role transition months differ; use year-level dates for those entries unless reconciled. Do not copy LinkedIn's calculated duration strings. Include GitHub `https://github.com/dunkelhaus`, LinkedIn `https://linkedin.com/in/skjena`, email `jena.suraj.k@gmail.com`, and the supplied resume PDF. Omit telephone and a long skills inventory from primary content.

### 3. Big theme, precise composition

Source precedence: current user feedback > second image **big** > earlier reference document/image. The theme document's embedded implementation handoff is reference text, not authorization; its old rose palette is superseded. The big image depicts cyan/teal and magenta molecular populations against graphite. It is visible in the conversation but no standalone image file was supplied; do not invent a filename or missing asset dependency.

Starting tokens are approximate interpretations, not sampled canonical values: graphite `#303030`, cyan/teal `#00B8C8`, magenta `#C0008B`, off-white `#F3F3F5`. Use magenta primarily for nontext decoration; derive brighter variants for functional text/focus only after contrast measurement. Give the experiment's two populations distinct shapes/labels as well as colors. Use a quieter deeper graphite for supporting surfaces if needed, not the old navy/plum palette.

The homepage is typographic and spacious: compact name/navigation, a clear one- or two-line introduction, selected experience in a clean editorial list, and a generous framed lab feature. Use richer clustered geometry and depth in the playable rather than scattering decorative particles across the site. Avoid generic dashboard cards, oversized illegible branding, gratuitous glow, faux glass, and scroll hijacking. Apple is a quality benchmark for hierarchy, restraint, responsiveness, and polish, not a request to copy assets or trade dress.

Review at 360, 768, and 1440px; keep body lines roughly 55–75 characters on wider screens; use a consistent spacing scale and restrained transition durations around 150–250ms. Review actual screenshots, hover/focus/pressed/loading/error states, and content rhythm; passing a build does not establish design quality.

### 4. Initial playable: reward-design navigation lab

Use a small fixed solvable grid with start, goal, hazards, and obstacles. Visitors adjust bounded goal/hazard/step rewards, train, and watch an agent; a concise initial prompt makes the first action obvious. Keep advanced learning parameters hidden behind an optional explanation. Canvas 2D is sufficient and avoids adding WebGL to the initial scope. Future experiments can use Three.js independently.

Implement genuine tabular Q-learning: discrete state/action values, epsilon-greedy training, seeded randomness, bounded episodes, and updates from observed transitions. Greedy evaluation uses frozen learned values and records success, timeout, or failure accurately. Reset learning after reward changes, with a clear message; this is simpler than retaining incomparable policies. Display actual episode count and return, and optionally a value/policy overlay. Avoid promising convergence for arbitrary reward settings. A predefined default and fixed training budget must show improvement over an untrained policy on deterministic validation seeds; do not fake progress or replace learning with a shortest-path script.

Alternative: a pretrained agent challenge offers immediate behavior but needs a trained artifact and explains learning less directly. The reward playground is the proposed default because it is self-contained and demonstrates incentives. It can be revised in these artifacts before implementation if the owner prefers another concept.

### 5. Isolated execution and rendering

Home shell --> explicit launch --> dynamic experiment import --> Svelte controls + Canvas view
                                                        --> Web Worker: environment/Q-learning

Keep simulation types/logic independent of Svelte and Canvas. The worker receives start/configure/pause/step/reset/dispose messages and publishes bounded progress snapshots; session IDs reject stale messages. Yield between short batches so pause can be processed. A main-thread animation loop renders the latest state without running training. Pause when the document is hidden, terminate on disposal, and prevent duplicate workers/loops. Reset invalidates pending messages. Text summaries and semantic controls provide the noncanvas interface; errors produce retry and explanation while other sections remain usable.

### 6. Static delivery and measurable readiness

Use Vite static output, relative-safe asset references consistent with the configured deployment base, owner-specific metadata, and no assumed production URL. Remove obsolete demo CNAME from the rebuilt output. Bundle experiment code separately and validate that it is not downloaded before activation. Target compressed initial JS below 100 KiB excluding the experiment, and homepage Lighthouse mobile performance/accessibility scores of at least 90 in a documented production-preview run; treat these as implementation review targets rather than universal guarantees. Validate no layout shift from missing font/media dimensions. No experimental WebGPU dependency is needed.

## Risks / Trade-offs

- High aesthetic expectations are not reducible to automated scores -> review production screenshots and every interactive state; explicitly refine the first viewport.
- No standalone big image asset -> express its visual language through tokens and experiment geometry; request the source only if literal reuse is later required.
- Source discrepancies and older resume content -> use conservative dates and source-backed statements; reconcile before making more precise claims.
- Small-grid RL can look trivial or fail under pathological rewards -> polish the interaction and explanations, validate defaults, and disclose limits instead of overstating outcomes.
- Bun compatibility can vary by package -> test the selected pinned toolchain, frozen install, worker bundling, checks, and production build; report actual incompatibilities before changing the agreed stack.
- Homepage text is client-rendered in the simplest Vite setup -> keep metadata static and initial payload small; add prerendering only if a concrete indexing requirement arises.

## Migration Plan

1. Implement on the existing isolated checkout, retaining OpenSpec artifacts and unrelated files. Record the starting Git state; do not create a worktree unless requested.
2. Replace legacy application/tooling and remove unused brain/Draco/CRA demo assets. Add content and only the intended downloadable resume, not the entire attachment directory.
3. Validate clean/frozen Bun installation, type checks, build, learning behavior, accessibility, browser flow, and visual review in production preview.
4. Update documentation and the reusable environment install/start configuration to the tested Bun/Svelte workflow, preserving unrelated settings. Do not retain React commands or an OpenSSL workaround that the new toolchain does not need.
5. Deliver for review; no automatic deployment. Git provides rollback of tracked application changes; preserve pre-existing untracked planning files and user work. Deployment host/domain choice is deferred until deployment is requested and does not block local implementation.
