# Design

## Context

See proposal.md. The root README is currently a site developer guide in a username-matching public repository. The website content and supplied resume establish the professional facts and contact destinations.

## Goals / Non-Goals

Goals: readable profile introduction, distinctive big-inspired identity, GitHub-compatible local assets, preserved contributor instructions.

Non-goals: music, playable links/previews, stats cards, automation, website behavior changes, credentials, external widget services.

## Decisions

Use local static SVG banner and toolkit assets with light/dark variants selected using picture elements. The banner uses graphite, cyan, magenta, and a molecular cluster motif, with the name and brief descriptor. Render text as actual text with system font fallbacks, and provide meaningful README alt text. No SVG scripts or external resources.

Use concise source-backed introduction and three focus bullets. Link website home, LinkedIn, and the already-public supplied resume. Keep toolkit limited to Python, Go, PyTorch, AWS, and Svelte; provide text labels rather than relying on logo recognition.

Move existing README intact to docs/development.md, correcting its links relative to docs. Retain all install, validation, deployment, and source notes. Use a short contributor link at the profile's bottom. Avoid extensive HTML tables that render poorly on mobile.

## Risks / Trade-offs

- GitHub sanitizes HTML and controls page colors -> restrict formatting to Markdown, picture, source, and img elements with local assets.
- SVG appearance varies by font -> use common font stacks and inspect renders at profile and mobile widths.
- Rich elements can obscure the introduction -> use one banner and one short toolkit row, retaining selectable text biography.
- Root README location changes developer links -> audit local destinations after relocation.
