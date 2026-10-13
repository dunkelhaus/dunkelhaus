# Suraj Jena — personal site

A static Svelte 5 + TypeScript + Vite site, managed with **Bun 1.4.3**. Graphite, cyan, and magenta come from the supplied second molecular reference, **big**. The homepage presents selected professional experience; the lab is a new personal educational experiment, not an employer project.

## Development

Install Bun 1.4.3 using its official distribution or the npm-distributed `bun@1.4.3` package. In the prepared cloud environment it is available at `/workspace/bun-tools/node_modules/.bin/bun`.

```sh
export PATH=/workspace/bun-tools/node_modules/.bin:$PATH
cd /workspace/dunkelhaus
bun install --frozen-lockfile
bun run dev
```

Vite prints the development address. Each cloud task already has an isolated checkout; use it rather than creating a worktree unless requested. No credentials, database, backend, or external inference service are needed. Live processes must be restarted after restoring the environment.

## Validation

```sh
bun run check
bun run test
bun run build
bun run test:browser
bun run preview --port 4173 --strictPort
```

`test:browser` starts the production preview automatically, runs Playwright and axe accessibility checks, and captures review screenshots under `docs/review/`. It uses `/usr/bin/chromium` in this environment. Elsewhere set `CHROMIUM_PATH` to an installed Chromium binary. The browser tests exercise real training, evaluation, resets, cleanup, fallback, keyboard/touch controls, responsive layouts, and lazy loading. Unit tests cover the learning engine and worker runtime lifecycle.

## Content and design

- `src/lib/content.ts`: selected experience and contact destinations.
- `src/App.svelte`: introduction, experience, lab, and about sections.
- `src/styles.css`: design tokens, responsive composition, focus and motion rules.
- `src/lib/Molecules.svelte`: static, deterministic vector interpretation of **big**, not a scientific simulation.
- `public/suraj-jena-resume.pdf`: supplied resume, intentionally downloadable. Its original content is unchanged.
- `src/lab/`: isolated learning engine, worker runtime, canvas view and controls.

Copy is grounded in the supplied LaTeX/PDF resume and LinkedIn export. LinkedIn's newer AI-tooling detail is included. Wells Fargo's end month differs between sources; year-level dates avoid making an unverified claim. Do not copy calculated tenure strings or invent metrics. Contact links use the supplied GitHub, LinkedIn, and email; telephone is omitted from page content (the original downloadable resume includes its original contact information). About's music interests come from the supplied reference brief.

The earlier navy/violet/rose theme is superseded by **big**. The image was supplied in conversation, not as a separate local image asset. Palette values are approximate interpretations. Bright accent variants support text contrast; deeper magenta is decorative. Inter is self-hosted from Fontsource under OFL-1.1 (license included at public/licenses/inter.txt); no Google Fonts request is required.

See [the experiment explanation](experiment.md) and [review evidence](review/validation.md). OpenSpec change: `rebuild-personal-website`.

## Delivery

`bun run build` emits static files in `dist/`. Asset paths use Vite's relative base. The production domain is `dunkel.haus`; `public/CNAME` is copied to `dist/CNAME`, and canonical/Open Graph URLs use `https://dunkel.haus/`. Deployment and environment publication are separate from a local build.

### GitHub Pages

The workflow in `.github/workflows/pages.yml` installs the pinned toolchain, checks types, runs engine tests, and builds/uploads `dist` on pushes to `master`. Enable **Settings → Pages → Build and deployment → Source: GitHub Actions**, then run **Actions → Deploy website to GitHub Pages → Run workflow** on `master`. Future pushes deploy automatically. The deployment step needs Pages enabled; the build can succeed before that setting is enabled.

The website address is `https://dunkel.haus/`. Set **Settings → Pages → Custom domain** to `dunkel.haus`, configure the domain's DNS for GitHub Pages, and enable **Enforce HTTPS** once available. Actions-based publishing uses the repository's Pages custom-domain setting; the CNAME file alone does not apply that setting. Relative Vite asset paths work both at the custom-domain root and at the repository subpath, including the resume and worker chunks.
