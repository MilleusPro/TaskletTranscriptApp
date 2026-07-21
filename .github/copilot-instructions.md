# GitHub Copilot instructions

This repository contains Tasklet Transcript App, a private transcript
management application.

Before making substantial changes, read:

- `AGENTS.md`
- `docs/PRODUCT_REQUIREMENTS.md`
- `docs/DATA_MODEL.md`
- `docs/TRANSCRIPT_FORMAT.md`

## Current stack

Use only:

- HTML
- CSS
- Vanilla JavaScript
- Browser localStorage

Do not introduce frameworks, build tools, databases, package managers, or
backend services unless explicitly requested.

## Coding standards

- Keep structure in `index.html`.
- Keep presentation in `style.css`.
- Keep application behavior in `script.js`.
- Use semantic HTML and accessible controls.
- Give buttons descriptive labels.
- Add empty, loading, and error states where relevant.
- Use reusable JavaScript functions.
- Avoid duplicate logic.
- Avoid using `innerHTML` with untrusted imported content.
- Validate imported and form data.
- Preserve existing functionality.
- Keep the browser console free of errors.

## Product rules

- Meetings are sorted newest first by default.
- Customer, partner, and participant records must be treated separately.
- The user must review extracted transcript information before saving.
- Imported transcript content must not be silently discarded.
- Original meeting text must remain available in the meeting viewer.
- Action items must remain connected to their source meeting.
- Commercial notes must be labelled as meeting notes.

## Scope rules

Implement one requested task at a time.

Do not:

- Replace the technology stack.
- Perform unrelated redesigns.
- Invent undocumented product requirements.
- Mark a task complete when the requested workflow is broken.

After implementing a task, report:

- Files changed.
- Features added.
- How the feature was tested.
- Known limitations.