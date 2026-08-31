# Ulink Assist Case Storyboard MVP

A framework-free static dashboard built with one HTML file, one CSS file and one JavaScript file.

## Files

- `index.html` - all dashboard views and layout
- `style.css` - complete dashboard styling
- `app.js` - mock data, rendering, filtering, navigation and case detail behaviour
- `.env` - private placeholders for future Supabase, n8n and integration credentials
- `.gitignore` - prevents `.env` from being committed

## Run locally

Open `index.html` directly in a browser, or use VS Code Live Server.

No Vite, npm package or build command is required.

## Current dashboard behaviour

- Master Case list and filtering
- Global search by case, patient, phone, email or ticket
- Unified Email, WhatsApp and document timeline
- Linked ticket view
- Match evidence view
- Read-only AI summary, next step and suggested reply
- Unmatched interactions view
- Ingestion status view
- Responsive mobile navigation

## Next integration step

Replace the mock `dataRepository` methods in `app.js` with Supabase queries. n8n can populate interaction and AI suggestion tables. The frontend should continue to use only read permissions.

## Authentication

The CMS is protected by a simple internal password login.

Authentication is handled by Vercel serverless API routes:

- `/api/login`
- `/api/session`
- `/api/logout`

The production secrets are stored in Vercel Environment Variables:

- `CMS_LOGIN_PASSWORD`
- `CMS_SESSION_SECRET`

Do not store these values in `app.js`, `index.html`, GitHub, or other frontend files.

The login creates a secure HttpOnly session cookie. The dashboard only initializes after the session has been verified.

To change the login password:

1. Open the Vercel project.
2. Go to Settings → Environment Variables.
3. Update `CMS_LOGIN_PASSWORD`.
4. Redeploy the Production deployment.