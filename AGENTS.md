# AGENTS.md

## Project purpose

This repository contains Transcript Hub, a private transcript-management application for organizing meeting transcripts by partner, customer, and participant.

## Working rules

- Read `docs/PRODUCT_SPEC.md` before changing product behavior.
- For substantial changes, update `docs/IMPLEMENTATION_PLAN.md` before implementation.
- Do not stop at a visual mockup when the task requires working behavior.
- Prefer complete vertical slices over many unfinished components.
- Keep TypeScript strict.
- Validate all server inputs.
- Keep database access out of presentation components.
- Keep parsing logic isolated from UI logic.
- Preserve original source data during parsing and normalization.
- Use meeting date, not import date, for transcript chronology.
- Store partner/customer roles on transcript relationships.
- Never assume an organization has only one permanent role.
- Preserve both source filename and extracted display title.
- Add tests for parsing bugs and entity-resolution bugs.

## Privacy

- Never send transcript content to external APIs unless a future task explicitly requires and authorizes it.
- Do not add external analytics.
- Do not commit uploaded transcripts, local databases, generated document text, or customer data.
- Keep uploads outside publicly served directories.
- Sanitize imported HTML before rendering.
- Avoid logging transcript contents.

## UX

- Maintain the three-pane desktop layout:
  entity cards, transcript list, transcript viewer.
- Keep the viewer optimized for reading long documents.
- Include keyboard-accessible controls and visible focus states.
- Include loading, empty, error, and needs-review states.
- Avoid adding features that distract from import, lookup, search, and reading.

## Verification

Before reporting completion, run all available:
- formatting checks
- linting
- type checks
- unit tests
- integration tests
- end-to-end tests
- production build

Report the exact commands run and any failures that remain.
