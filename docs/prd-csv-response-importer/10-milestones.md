# CSV Response Importer — Milestones

## MVP (v1) scope

- SurveySparrow connection (API token), fetch surveys and questions.
- CSV upload (getCsvUploadUrl + validateCsv), column mapping (saveColumnMapping), import configuration (timestamp, timezone, duplicate rule).
- startImport + processImportChunk (chunked via $next), rate-limit and retry handling, import run persistence and status.
- Import history (getImportHistory, getImportDetails), error log, getErrorRowsDownloadUrl, retryFailedImports.
- Full-page UI: Dashboard, New Import (survey selection, CSV upload, mapping, config), Import Progress, Import History, Import Details.

**Deliverables:**

- Backend: `app-backend/server.js` exporting all functions listed in 08-api-contracts; handlers implemented using AppNest SDK only ($db, $http, $file, $next); no SDK in package.json.
- Manifest: `backend_api_functions`, `event_listener_functions` (empty), `installation_params`, `whitelisted_domains` complete and consistent with server.js.
- Frontend: `app-frontend/src/App.jsx` and components using Twigs (`@sparrowengg/twigs-react`, `@sparrowengg/twigs-react-icons`); backend invoked via `window.appnestClient.backend.invoke`.
- Data: All persistent state in $db with keys and types documented in 07-data-model; CSV and error files in $file with paths in 07-data-model.
- Validation: All items in `appnest-tools/appnest-prd-generator/validation-checklist.md` passed → **READY TO BUILD APP**.

---

## Phase 1 (MVP)

| # | Milestone | Dependencies | Done when |
|---|-----------|--------------|-----------|
| M1 | SurveySparrow integration | installation_params (API key), whitelisted_domains | getSurveys and getSurveyQuestions return data from API; token from installation. |
| M2 | CSV upload and validation | $file getUploadUrl; backend validateCsv | User can upload CSV and get validation result (headers, mandatory fields, sample errors). |
| M3 | Mapping and import config | $db column_mapping; run config in startImport | saveColumnMapping persists; startImport accepts config (timestamp, timezone, duplicate rule). |
| M4 | Import engine (chunked) | $next processImportChunk; $http to SurveySparrow submission API; $db import_run | startImport creates run and calls processImportChunk; chunks process rows, handle 429, update run; run completes with success/failure counts and errorLog. |
| M5 | History and retry | getImportHistory, getImportDetails, getErrorRowsDownloadUrl, retryFailedImports | User can list runs, view details, download error rows, retry failed. |
| M6 | Full-page UI | All backend_api_functions | All screens implemented; each action calls correct functionName; empty/loading/error states. |

---

## Phase 2 (post-MVP)

- Saved mapping presets per survey.
- Export import history as CSV.
- Optional: resume interrupted import (resumeImport).
- Optional: retention job ($schedule) to delete $file objects and clean old run metadata beyond retention period.
- OAuth for SurveySparrow (if required).

---

## Dependencies and risks

- **SurveySparrow API:** Availability and rate limits; document limits and backoff in NFRs. Submission API payload shape (multi-choice: comma-separated vs option IDs vs labels) must be aligned with mapping and validation.
- **Large CSV:** Chunk size and timeout tuned so one chunk finishes within processImportChunk timeout; if single row is slow (e.g. API latency), consider smaller chunks.
- **Invalid mapping:** validateCsv and/or startImport must reject or warn when required survey questions are not mapped; prevent import with unmapped required fields.
