# SurveySparrow Contact Export — Overview

## Product name

**SurveySparrow Contact Export** (working title)

## Vision (elevator pitch)

A fast Appnest full-page app that connects to the **SurveySparrow public API**, lists contacts in a clear, searchable interface with pagination, and lets users select one or many contacts and download them as **CSV**—without switching into SurveySparrow’s native contacts UI.

## Scope for v1

Deliver a **read-only** contacts browser optimized for **discovery, filtering, and export**.

- **In scope:**

  - Load contacts from SurveySparrow via **`GET /v3/contacts`** (server-side proxy using Appnest **$fetch** and installation API credentials).
  - **Paginated** list (aligned with API `page`, `limit`, `has_next_page`; respect API max page size, e.g. up to 50 per page).
  - **Search** mapped to API `search` (or equivalent documented query parameter).
  - **Filters** supported where the API exposes them (e.g. contact list, type/status, contact_type, created date range)—minimum: search + at least one meaningful filter (e.g. list or status) if available from API.
  - **Multi-select** rows; **Export selected** as CSV (columns = visible / standard contact fields returned by the list endpoint).
  - Polished **Twigs** UI: table or list, loading/error/empty states, responsive layout.

- **Out of scope (v1):**

  - Creating, editing, or deleting contacts in SurveySparrow.
  - Bulk import or syncing schedules ($schedule).
  - Subscribing to platform events (e.g. `onContactCreate`) unless explicitly added in a later phase.
  - Storing full contact databases in **$db** (no local replica of all contacts).

## Success criteria

- Users can open the app, authenticate via pre-configured SurveySparrow credentials, and see **accurate** contact rows within **~3 seconds** under normal API latency.
- **Pagination** works for large accounts without loading all rows at once.
- **Search/filter** updates results predictably (debounced where appropriate to avoid API spam).
- Users can **select multiple** contacts and download a **valid CSV** that opens in Excel/Sheets.
- **No secrets** in code; API access only via **installation_params** (e.g. product-bound API key).

## AppNest context

- This app runs on the **AppNest** framework. Backend entry: `app-backend/server.js` (exported functions only). Frontend entry: `app-frontend/src/App.jsx`. All backend I/O uses **Appnest Functions** ($db, $fetch, $file, $next, $schedule; `getTraceId` for logging). See `appnest-ai-context/appnest-governance/appnest-functions/` and related governance docs for full reference.
