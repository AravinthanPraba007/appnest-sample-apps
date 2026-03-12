# CSV Response Importer — Feature Requirements

## Core features (v1)

| ID | Feature | Description | Priority | Acceptance criteria |
|----|---------|-------------|----------|---------------------|
| F1 | SurveySparrow connection | Connect via API token; fetch surveys and survey questions. | Must have | User can authenticate with token (installation_param); getSurveys and getSurveyQuestions return data from SurveySparrow Public API. |
| F2 | CSV upload and validation | Upload CSV; validate file format, headers, mandatory fields. | Must have | User uploads file via getCsvUploadUrl + client upload; validateCsv returns validation result (and errors per row if applicable). |
| F3 | Column mapping | Map CSV columns to survey question fields. | Must have | User can map each relevant CSV column to a survey question; saveColumnMapping persists mapping; invalid or missing required mapping prevents import or prompts remap. |
| F4 | Import configuration | Configure submission timestamp (current / CSV column / custom), timezone, duplicate handling. | Must have | User can set timestamp source and timezone; set duplicate rule (allow / skip / update); startImport uses these settings. |
| F5 | Import execution | Process CSV row-by-row via SurveySparrow Submission API with chunking and rate-limit handling. | Must have | startImport creates run record; processes rows in chunks (e.g. $next); handles 429 with backoff; updates run status and counts; partial row failures logged, remaining rows continue. |
| F6 | Import run history | Store and display import runs with status, counts, timestamps, error log; view details, download error rows, retry failed. | Must have | getImportHistory returns list; getImportDetails returns full run + error log; getErrorRowsDownloadUrl returns signed URL; retryFailedImports resubmits failed rows for a run. |

## Configuration / settings

- **Installation:** SurveySparrow API token (installation_param, secure). No app-level config stored in $db for v1 beyond per-import-run options (timestamp, duplicate rule, timezone) chosen at import time.
- Optional future: default timezone or default duplicate rule stored in $db per workspace (out of scope for v1).

## Platform events (if any)

None for v1. All flows are user-initiated via UI calling backend_api_functions.

## UI surface

- **Full-page app:** Yes. UI is built in `app-frontend/src/App.jsx` and child components; use `@sparrowengg/twigs-react` and `@sparrowengg/twigs-react-icons` for components and icons.
- **Custom installation frontend:** No (v1 uses standard installation with installation_params for API token).

## Out of scope (v1)

- OAuth for SurveySparrow; multi-workspace or shared import; real-time collaboration; webhook subscriptions for post-import; saved mapping presets (Phase 2); export of import history as CSV (Phase 2).
