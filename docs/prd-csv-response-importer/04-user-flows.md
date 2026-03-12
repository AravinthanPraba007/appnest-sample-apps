# CSV Response Importer — User Flows

## Flow 1: New import (end-to-end)

**Trigger:** User starts a new import from the app UI.  
**Actor:** Survey creator / admin.  
**Screen(s):** Dashboard → New Import → Survey Selection → CSV Upload → Column Mapping → Import Configuration → Import Progress.  
**Steps:**

1. User connects account (API token via installation); app fetches surveys via `getSurveys`.
2. User selects survey (and version if applicable); app fetches questions via `getSurveyQuestions` for mapping.
3. User uploads CSV (via `getCsvUploadUrl` then client upload; app validates via `validateCsv`).
4. User maps CSV columns to survey questions (optional but recommended); mapping saved via `saveColumnMapping`.
5. User configures import: submission time (current / CSV column / custom), timezone, duplicate rule; then starts import via `startImport`.
6. App processes CSV (chunked via $next or background job); user sees progress via `getImportStatus`; on completion, results shown (total / success / failure, error log).

**Outcome:** Responses imported into the selected survey; import run recorded in history; user can open Import Details to view errors and retry failed rows.

**AppNest note:** All backend steps are invoked via `window.appnestClient.backend.invoke({ functionName, payload })` with functionNames from `backend_api_functions`. No platform events required for this flow.

---

## Flow 2: View history and retry failed

**Trigger:** User opens Import History from Dashboard.  
**Actor:** Survey creator / admin (or data steward).  
**Screen(s):** Import History → Import Details.  
**Steps:**

1. User opens Import History; app calls `getImportHistory` (with optional filters).
2. User selects a run to view details; app calls `getImportDetails`.
3. User may download error rows via `getErrorRowsDownloadUrl` and/or trigger `retryFailedImports` for that run.

**Outcome:** User sees all runs, inspects failures, downloads error CSV, and optionally retries failed rows.

---

## Additional flows

- **Survey selection only:** User can open New Import and only fetch surveys / questions (getSurveys, getSurveyQuestions) without uploading yet.
- **Validation only:** After CSV upload, user can run validateCsv and fix mapping or data before starting import.
- **Resume interrupted import:** If an import run is in "Processing" and was interrupted, user can resume (backend uses stored state and $next to continue from last chunk); optional "Resume" action on Import Details that calls `resumeImport` (if implemented in v1).
