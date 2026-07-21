# Tasklet Transcript App — Agent Guide

## Project purpose

This repository contains a transcript management application.

The application should allow a user to:

- Import cleaned meeting transcripts.
- Store meeting information.
- Browse meetings by customer, partner, participant, and date.
- Show meetings newest first by default.
- Open a meeting in a transcript viewer.
- Track decisions, open questions, and follow-up actions.
- Search across all imported meetings.

## Current technology

The first version uses:

- HTML
- CSS
- Vanilla JavaScript
- Browser localStorage

Do not introduce React, Next.js, Vue, Angular, a database, or a backend unless a task explicitly asks for it.

## Important documentation

Before implementing features, read:

- `docs/PRODUCT_REQUIREMENTS.md`
- `docs/DATA_MODEL.md`
- `docs/TRANSCRIPT_FORMAT.md`
- `.github/copilot-instructions.md`

## Development rules

- Keep HTML, CSS, and JavaScript in separate files.
- Use semantic HTML.
- Use clear and descriptive JavaScript function names.
- Avoid global variables where practical.
- Do not use inline CSS or inline JavaScript.
- Keep the interface responsive.
- Do not delete existing working features unless explicitly instructed.
- Do not redesign unrelated parts of the application.
- Complete one feature at a time.
- Preserve all imported transcript text.
- Never silently discard data that could not be classified.

## Data rules

- Meetings must be sorted newest first by default.
- Customers and partners are different entity types.
- A meeting may have a customer, a partner, both, or neither.
- A participant may belong to a customer, partner, Tasklet, or another company.
- The original transcript content remains the source of truth.
- Automatically extracted data must be reviewable before final saving.
- Commercial information is meeting information, not an official quotation.

## Agent workflow

For each task:

1. Read the relevant documentation.
2. Inspect the existing files.
3. Explain the planned changes briefly.
4. Implement only the requested scope.
5. Check for JavaScript errors.
6. Test the main workflow manually.
7. Summarize which files were changed.
8. Mention any remaining limitations.