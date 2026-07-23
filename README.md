# Tasklet Transcript App

A private meeting transcript management application.

The application is intended to store cleaned meeting transcripts and organize them by:

- Customer
- Partner
- Participant
- Date
- Meeting type
- Topic
- Follow-up action

## Current status

The project is currently an early browser-based prototype.

## Technology

- HTML
- CSS
- Vanilla JavaScript
- Browser localStorage
- Supabase (Auth, Postgres, Storage)

## Run the application

In GitHub Codespaces, open a terminal and run:

```bash
python3 -m http.server 8000
```

Then open:

- http://localhost:8000/

## Deployment

Expected GitHub Pages URL:

- https://milleuspro.github.io/TaskletTranscriptApp/

Deployment trigger:

- Automatic on every push to `main`
- Manual from the GitHub Actions UI using **Run workflow**

Workflow location:

- GitHub repository → **Actions** → `Deploy static site to GitHub Pages`
- Workflow file: `.github/workflows/deploy-pages.yml`

Enable GitHub Pages (one-time repository setting):

1. Open repository **Settings**.
2. Go to **Pages**.
3. Set **Source** to **GitHub Actions**.
4. Save settings.

Supabase key guidance:

- `SUPABASE_PUBLISHABLE_KEY` is intentionally browser-visible and safe for client applications.
- Never add a Supabase secret key or service-role key to this repository.

Supabase project requirements:

- The Supabase Auth URL configuration must allow the deployed GitHub Pages URL.
- Follow the manual setup in `docs/DEPLOYMENT.md`.

How to test after publish:

1. Open https://milleuspro.github.io/TaskletTranscriptApp/.
2. Sign in with an email/password account from your Supabase project.
3. Confirm you can load the app, navigate sections, import a DOCX transcript, and sign out.
4. Open browser DevTools and confirm there are no console errors.
