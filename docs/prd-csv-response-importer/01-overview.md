# CSV Response Importer — Overview

## Product name

CSV Response Importer

## Vision (elevator pitch)

The CSV Response Importer allows users to upload survey responses via a CSV file and automatically import them into a selected SurveySparrow survey using public APIs. It reduces manual entry, provides traceability through import history, and handles failures and retries with configurable timestamp and duplicate handling.

## Scope for v1

- **In scope:**
  - Connect to SurveySparrow via API (API token authentication).
  - Fetch surveys and survey questions for mapping.
  - Upload CSV, validate format/headers/mandatory fields, map columns to survey questions.
  - Configure submission timestamp (current time / CSV column / custom) and timezone; configure duplicate handling (allow / skip / update).
  - Process import via SurveySparrow Submission API with batch/chunk processing and rate-limit handling.
  - Import run history: store and display import ID, survey, file, status, counts, timestamps, created-by, error log; view history, download error rows, retry failed imports.
  - Secure CSV storage with retention policy (e.g. 30–90 days).
  - Full-page UI: Dashboard, New Import (survey selection, CSV upload, column mapping, import configuration), Import Progress, Import History, Import Details.

- **Out of scope (v1):**
  - OAuth-based SurveySparrow auth (v1 uses API token only).
  - Multi-tenant or cross-workspace import sharing.
  - Real-time collaboration on mapping or import.
  - Native SurveySparrow webhook subscriptions for post-import events.

## Success criteria

- Users can complete end-to-end flow: authenticate → select survey → upload CSV → map columns → configure options → run import and see results.
- Import history is persisted and searchable; failed rows are downloadable and retriable.
- Large CSVs (e.g. up to 50k rows) are handled via chunked processing and optional background jobs without blocking the UI.
- API rate limits and transient errors are handled with retries and backoff; duplicate and timestamp behaviour is configurable and documented.

## AppNest context

- This app runs on the **AppNest** framework. Backend entry: `app-backend/server.js` (exported functions only). Frontend entry: `app-frontend/src/App.jsx`. All backend I/O uses the AppNest SDK ($db, $http, $file, $next, $schedule). See `appnest-tools/appnest-governance/` for full reference.
