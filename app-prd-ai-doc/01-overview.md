# SurveySparrow Contact CSV Export — Overview

## Product name

SurveySparrow Contact CSV Export

## Vision (elevator pitch)

A full-page Appnest app that lets SurveySparrow admins browse their account contacts (pulled live from the SurveySparrow REST API), multi-select the rows they care about, and download those contacts as a single CSV file—without leaving SurveySparrow.

## Scope for v1

Deliver a read-only, API-key–authenticated experience: list contacts with pagination and search, select contacts (including across pages via retained selection state), and export the selected subset as CSV. No writes to SurveySparrow (no create/update/delete contacts).

- **In scope:**  
  - Full-page UI using Twigs only.  
  - Backend proxy to `GET https://api.surveysparrow.com/v1/contacts` via `$fetch.request` using the workspace API credential.  
  - Query params: `page`, `maxResults` (1–100), optional `search`, optional `type` (`active` | `unsubscribed` | `bounced`).  
  - Client-side CSV generation and browser download for **selected** contacts (user selects rows; selection persists across pages in UI state).  
  - Clear loading, empty, and error states; basic handling of non-200 and 429 from SurveySparrow.

- **Out of scope (v1):**  
  - OAuth providers other than the standard SurveySparrow product API key (no separate OAuth config for this app).  
  - Editing contacts, contact lists, segments, or imports.  
  - Scheduled exports, email delivery, or `$file` upload of CSV.  
  - Server-side CSV via `$file` (v1 uses in-browser download only).

## Success criteria

- A user can open the app, see their contacts (first page) within a few seconds on a typical account.  
- Pagination and search work without losing prior row selections until the user clears them or exports.  
- Export produces a valid CSV with a stable header row and one row per selected contact; UTF-8 with appropriate escaping for commas and quotes.  
- No secrets in code; API token comes only from installation / product binding.  
- `manifest.json` lists exactly one `backend_api_function` used by the UI and `whitelisted_domains` covers SurveySparrow’s API host.

## AppNest context

- This app runs on the **AppNest** framework. Backend entry: `app-backend/server.js` (exported functions only). Frontend entry: `app-frontend/src/App.jsx`. All backend I/O uses **Appnest Functions** ($db, $fetch, $file, $next, $schedule; `getTraceId` for logging). See `appnest-ai-context/appnest-governance/appnest-functions/` and related governance docs for full reference.
