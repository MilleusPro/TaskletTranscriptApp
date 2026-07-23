# Deployment configuration

This document covers the manual Supabase setup required when publishing this static app to GitHub Pages.

## GitHub Pages target

- https://milleuspro.github.io/TaskletTranscriptApp/

## Supabase Auth URL configuration

In Supabase Dashboard:

1. Open **Authentication**.
2. Open **URL Configuration**.
3. Set values to:

Site URL:

- https://milleuspro.github.io/TaskletTranscriptApp/

Redirect URLs:

- https://milleuspro.github.io/TaskletTranscriptApp/
- https://milleuspro.github.io/TaskletTranscriptApp/**

## Why these URLs matter

- Email/password sign-in should work on the deployed site.
- These URL settings are especially important for future password reset, invitation, and email confirmation links.
- If the deployed URL is not allowed, redirect-based auth flows can fail.

## Security requirements

- Keep existing RLS policies enabled.
- Do not make the transcript Storage bucket public.
- The Supabase publishable key may be used in browser code.
- Secret keys and service-role keys must never be committed to this repository.

## Post-deployment verification checklist

1. Open the deployed URL.
2. Sign in with a valid Supabase email/password user.
3. Confirm meetings, action overrides, and settings load correctly.
4. Import a DOCX file and verify extraction still runs in-browser.
5. Confirm original transcript downloads still use authenticated Supabase APIs.
6. Sign out and sign back in to validate auth lifecycle behavior.
