# CSV Response Importer — Overview

## Product name

CSV Response Importer for Survey Integration

## Vision (elevator pitch)

The CSV Response Importer is a lightweight Appnest application that lets users upload survey responses via a CSV file and import them into a selected SurveySparrow survey. Users authenticate with the SurveySparrow API, pick a survey, map CSV columns to questions, and submit responses through the response submission API—all via a UI.

## Scope for v1

- **In scope:**
  - API token authentication (installation param).
  - Fetch and display surveys (GET /v3/surveys).
  - Fetch survey details and questions for mapping (GET /v3/surveys/{survey_id}).
  - CSV upload (frontend), column mapping UI, and submission via backend (POST /v3/surveys/{survey_id}/responses).
  - Import progress and summary report (success / failed rows, error messages).
  - **Import run history:** Store each import run in $db with run metadata (when run, survey, total/success/failed counts, status). List and view run details in UI.
  - **CSV file per run:** Store the CSV file used for each run via $file; user can download the original CSV from run history.
  - **Global submission-time settings:** Timezone selection (e.g. IANA timezone) and optional “submission created time” (datetime + timezone) so imported responses can be stamped with a chosen time (when API supports it).
  - Up to 10,000 responses per import; retries (max 3) for failed API calls.

- **Out of scope (v1):**
  - Custom installation frontend (use default installation).
  - Scheduled or automated imports; webhooks.
  - Editing or deleting imported responses via this app.
  - Batch size above 10,000 per run (document as limit; batching can be added later).
  - Re-run failed rows only; export history as CSV; delete/archive old runs (see [Additional flows and future cases](11-additional-flows-and-future-cases.md) for future).

## Success criteria

- User can complete end-to-end flow: enter API key → select survey → upload CSV → set timezone/created time (optional) → map columns → submit → see import report; then view run history and download the CSV used for any run.
- All SurveySparrow API calls go through backend using $http; frontend calls backend only via `window.appnestClient.backend.invoke({ functionName, payload })`.
- Failed rows are reported with clear error messages; no silent failures.
- Run history shows when each run was executed, which survey, total/success/failed counts, and allows downloading the original CSV. Submission created time (with timezone) is applied when the API supports it; otherwise stored for audit and shown in run detail.

## AppNest context

- This app runs on the **AppNest** framework. Backend entry: `app-backend/server.js` (exported functions only). Frontend entry: `app-frontend/src/App.jsx`. All backend I/O uses the AppNest SDK ($db, $http, $file, $next, $schedule). See `appnest-tools/appnest-governance/` for full reference.
