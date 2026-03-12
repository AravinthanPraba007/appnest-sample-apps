# CSV Response Importer — User Flows

## Flow 1: Authenticate and select survey

**Trigger:** User opens the app and provides (or has already provided) SurveySparrow API token.  
**Actor:** User (customer success / researcher).  
**Steps:**

1. User enters or confirms SurveySparrow API key (from installation or auth page).
2. Frontend calls backend `getSurveys`; backend uses $http to call GET /v3/surveys.
3. App displays list of surveys (name, ID, status).
4. User selects the target survey.

**Outcome:** User has chosen the survey into which responses will be imported.

**AppNest note:** Frontend calls `window.appnestClient.backend.invoke({ functionName: 'getSurveys', payload: {} })`. Backend uses $http; token from installation context.

---

## Flow 2: Map CSV columns and import responses

**Trigger:** User uploads a CSV file.  
**Actor:** User.  
**Steps:**

1. User uploads CSV (frontend parses headers).
2. Frontend calls backend `getSurveyDetails` with selected surveyId; backend uses $http to GET /v3/surveys/{survey_id}; returns questions.
3. User sets **timezone** (e.g. IANA) and optionally **submission created time** (datetime + timezone) for this run—global or per-run.
4. UI shows CSV columns and survey questions; user maps each column to a question.
5. User confirms import.
6. Frontend sends to backend `submitResponses`: surveyId, mapped rows, CSV content (for storage), timezone, submissionCreatedTime. Backend generates runId, stores CSV via $file, creates run record in $db, submits rows (passing time when API supports it), updates run with success/failed counts.
7. App displays import report: total processed, success count, failed rows, error messages; run is added to history.

**Outcome:** Responses are imported where possible; user sees clear success/failure summary.

**AppNest note:** `getSurveyDetails` and `submitResponses` are in `backend_api_functions`; frontend invokes them via `invoke({ functionName, payload })`.

---

## Flow 3: View import history and download CSV

**Trigger:** User opens “Import history” (or similar) in the app.  
**Actor:** User.  
**Steps:**

1. Frontend calls backend `listImportRuns` (optional: limit, offset, surveyId filter).
2. Backend reads from $db (import_run records); returns list with runId, runAt, surveyId, surveyName, totalRows, successCount, failedCount, status, timezone, submissionCreatedTime.
3. UI displays table/list of runs (when run, survey, totals, status).
4. User clicks a run to view detail; frontend calls `getImportRun({ runId })`; backend returns full run metadata and a **CSV download URL** (via $file.getDownloadUrl for the stored file).
5. User clicks “Download CSV” to retrieve the original CSV used for that run.

**Outcome:** User can audit past imports and re-download the CSV used for any run.

**AppNest note:** listImportRuns and getImportRun are in backend_api_functions; CSV stored at path per 07-data-model ($file).

---

## Additional flows

- **Validation:** Optional pre-submit validation (CSV format, required columns) in frontend or via a dedicated backend function in a later phase.
- **More flows and future cases:** See [11-additional-flows-and-future-cases.md](11-additional-flows-and-future-cases.md).
