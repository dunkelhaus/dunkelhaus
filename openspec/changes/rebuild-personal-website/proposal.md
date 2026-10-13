# Proposal

## Why

The existing full-screen brain demo does not communicate Suraj Jena's professional experience or support a straightforward personal website. Replace it with a polished, approachable site that makes a strong first impression on hiring managers and a broader personal audience, with an interactive ML experiment demonstrating technical curiosity.

## What Changes

- **BREAKING**: Replace the React/Create React App brain experience with Svelte, TypeScript, Vite, and Bun; no legacy application behavior needs preservation.
- Introduce a responsive personal homepage with an introduction, selected professional experience, an interactive lab, and about/contact content.
- Establish a graphite, cyan/teal, and magenta visual identity based on the second supplied image, referred to as **big**. The earlier navy/violet/rose direction is superseded.
- Prioritize typography, spacing, restrained motion, accessible controls, and mobile polish; richer scientific visuals belong within experiments rather than obscuring primary content.
- Add one browser-based ML playable. The proposed implementation default is a small reward-design/navigation playground using genuine tabular Q-learning, with approachable controls and optional technical explanation. This specific experiment is a planning recommendation, not a previously confirmed user selection.
- Keep the site statically deployable with no required credentials, inference service, or backend. Leave space for future independently loaded 2D or 3D experiments without adding them now.

## Capabilities

### New Capabilities

- `personal-profile`: Truthful professional/personal content, navigation, selected experience, and contact/resume access.
- `visual-experience`: Responsive visual identity, accessible interaction, motion, and first-load presentation.
- `interactive-lab`: Discoverable, independently loaded ML experiments with a functioning initial RL playable and honest explanations.

### Modified Capabilities

None. The project has no existing durable OpenSpec specifications.

## Impact

The change replaces application source, CSS, package scripts/dependencies, and the Yarn lockfile with the new stack and Bun lockfile. It updates HTML metadata, obsolete CRA assets, documentation, and reusable cloud setup instructions after implementation. Preserve OpenSpec artifacts and unrelated user files. The existing CNAME names a demo domain and is not evidence of the owner's intended production domain; do not deploy or publish automatically. Supplied resume/LinkedIn materials inform copy, with conflicting dates handled conservatively. No external APIs or employer datasets are required.
