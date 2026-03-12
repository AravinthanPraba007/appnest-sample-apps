# CSV Response Importer — UI Screens

Full-page app in `app-frontend/src/App.jsx` and child components using **@sparrowengg/twigs-react** and **@sparrowengg/twigs-react-icons**. Screens align with [04-user-flows.md](04-user-flows.md) and [08-api-contracts.md](08-api-contracts.md).

---

## Screens overview

| Screen ID | Screen name | Purpose (one line) | Entry (how user reaches it) |
|-----------|-------------|--------------------|-----------------------------|
| S1 | Dashboard | Landing: quick actions and recent imports | App root / default route |
| S2 | New Import | Start new import flow | "New Import" from Dashboard |
| S3 | Survey Selection | Choose survey (and version) | Step 1 of New Import |
| S4 | CSV Upload | Upload and validate CSV | Step 2 after survey selected |
| S5 | Column Mapping | Map CSV columns to survey questions | Step 3 after CSV validated |
| S6 | Import Configuration | Set timestamp, timezone, duplicate rule | Step 4 before run |
| S7 | Import Progress | Show run status and counts | After startImport or from History |
| S8 | Import History | List past import runs | "Import History" from Dashboard |
| S9 | Import Details | Single run details, error log, download errors, retry | Click a run in Import History or from Progress |

---

## Screen 1: Dashboard

| Field | Description |
|-------|-------------|
| **Purpose** | Landing and navigation to New Import or Import History. |
| **How user reaches it** | Default route when opening the app. |
| **Layout / sections** | Header (app title); primary actions: "New Import", "Import History"; optional: last N import runs summary (from getImportHistory with limit). |
| **Main UI elements** | Twigs: Button(s), Card or list for recent runs (optional). |
| **User actions** | "New Import" → navigate to New Import (Survey Selection). "Import History" → navigate to Import History. Optional: click a recent run → **getImportDetails** (importId) → navigate to Import Details. |
| **Data shown** | Optional recent runs: from **getImportHistory** ({ limit: 5 }). |
| **Empty / loading / error** | Loading: spinner while getImportHistory. Empty: no recent runs message. Error: toast or inline message; retry button. |

---

## Screen 2: New Import (wrapper / stepper)

| Field | Description |
|-------|-------------|
| **Purpose** | Container for the new-import steps (Survey Selection → CSV Upload → Column Mapping → Import Configuration → Import Progress). |
| **How user reaches it** | From Dashboard "New Import". |
| **Layout / sections** | Stepper or tabs: 1. Survey, 2. CSV Upload, 3. Mapping, 4. Config, 5. Progress. Content area shows current step. |
| **Main UI elements** | Twigs: Stepper/Tabs, container for step content. |
| **User actions** | Next/Back between steps; step-specific actions documented in S3–S7. |
| **Data shown** | Current step; optional draft importId after getCsvUploadUrl. |
| **Empty / loading / error** | Per-step loading and error states. |

---

## Screen 3: Survey Selection

| Field | Description |
|-------|-------------|
| **Purpose** | Let user pick a survey (and version if applicable) for the import. |
| **How user reaches it** | First step inside New Import. |
| **Layout / sections** | List or dropdown of surveys; optional version selector; "Next" to CSV Upload. |
| **Main UI elements** | Twigs: Select/Dropdown, List, Button. |
| **User actions** | Load surveys: **getSurveys** ({}). Select survey (and version) → store in local state; "Next" → **getSurveyQuestions** ({ surveyId, surveyVersion? }) for later mapping step → navigate to CSV Upload. |
| **Data shown** | Surveys from **getSurveys**; selected surveyId (and version). |
| **Empty / loading / error** | Loading: while getSurveys/getSurveyQuestions. Empty: "No surveys" message. Error: display error, retry. |

---

## Screen 4: CSV Upload

| Field | Description |
|-------|-------------|
| **Purpose** | Upload CSV file and validate format/headers/mandatory fields. |
| **How user reaches it** | Step 2 of New Import (after survey selected). |
| **Layout / sections** | Upload area (drag-and-drop or file picker); "Get upload URL" then client uploads to signed URL; "Validate" button; validation result (success / errors list). "Next" to Column Mapping. |
| **Main UI elements** | Twigs: File upload component, Button, Alert/Message for validation result. |
| **User actions** | "Upload CSV": call **getCsvUploadUrl** ({ importId? }) → receive uploadUrl and importId → client PUT file to uploadUrl → then call **validateCsv** ({ importId } or { path }). "Next" (enabled when valid or user accepts) → navigate to Column Mapping with importId and surveyId. |
| **Data shown** | Validation result from **validateCsv**: valid, headers, errors (e.g. row-level). |
| **Empty / loading / error** | Loading: during getCsvUploadUrl, upload, validateCsv. Error: show validation errors or API error; allow fix and re-upload. |

---

## Screen 5: Column Mapping

| Field | Description |
|-------|-------------|
| **Purpose** | Map CSV columns to survey questions; save mapping for the import. |
| **How user reaches it** | Step 3 of New Import (after CSV uploaded and validated). |
| **Layout / sections** | Two columns: CSV column list (from validateCsv headers) and survey questions (from getSurveyQuestions); user assigns each CSV column to a question (or "Skip"). "Save mapping", "Next" to Import Configuration. |
| **Main UI elements** | Twigs: Select/Dropdown per row, Button. |
| **User actions** | "Save mapping": **saveColumnMapping** ({ importId, surveyId, mappings }). "Next" → navigate to Import Configuration. |
| **Data shown** | CSV headers (from validateCsv or stored); questions from getSurveyQuestions (cached from Survey Selection step). |
| **Empty / loading / error** | Loading: on saveColumnMapping. Error: e.g. invalid mapping (required question not mapped) → show message; prevent Next until resolved or user confirms. |

---

## Screen 6: Import Configuration

| Field | Description |
|-------|-------------|
| **Purpose** | Set submission timestamp (current time / CSV column / custom), timezone, and duplicate handling rule. |
| **How user reaches it** | Step 4 of New Import (after mapping saved). |
| **Layout / sections** | Timestamp source: radio (current / CSV column / custom); if CSV column, dropdown of CSV columns; timezone selector; duplicate rule: allow / skip / update. "Start Import" button. |
| **Main UI elements** | Twigs: Radio, Select, Button. |
| **User actions** | "Start Import": **startImport** ({ importId, surveyId, filePath, mapping, config }). On success → navigate to Import Progress (importId). |
| **Data shown** | Current selection for timestamp, timezone, duplicate rule. |
| **Empty / loading / error** | Loading: during startImport. Error: ResultData 4xx/5xx → show message; retry or go back. |

---

## Screen 7: Import Progress

| Field | Description |
|-------|-------------|
| **Purpose** | Show running or completed import status and counts. |
| **How user reaches it** | After startImport; or from Import History by opening a run. |
| **Layout / sections** | Run ID; status (Processing / Completed / Failed); total rows, success count, failure count; started time, completed time (if done). Optional: polling or one-time load. "View details" → Import Details. |
| **Main UI elements** | Twigs: Progress indicator or status badge, typography for counts and times, Button "View details". |
| **User actions** | **getImportStatus** ({ importId }) on load; optional poll while status is "processing". "View details" → **getImportDetails** ({ importId }) and navigate to Import Details. |
| **Data shown** | getImportStatus: status, totalRows, successCount, failureCount, startedAt, completedAt. |
| **Empty / loading / error** | Loading: while getImportStatus. Error: show error, link to History or retry. |

---

## Screen 8: Import History

| Field | Description |
|-------|-------------|
| **Purpose** | List past import runs with status and basic info. |
| **How user reaches it** | "Import History" from Dashboard. |
| **Layout / sections** | Table or list: Import ID, Survey (id or name), status, total/success/failure counts, started time; optional filter by survey, pagination. Row click → Import Details. |
| **Main UI elements** | Twigs: Table or List, Pagination, optional Filter (survey dropdown). |
| **User actions** | **getImportHistory** ({ limit, offset, surveyId? }) on load. Filter/pagination: recall with new params. Row click → navigate to Import Details (importId). |
| **Data shown** | getImportHistory: runs array (importId, surveyId, status, totalRows, successCount, failureCount, startedAt, etc.). |
| **Empty / loading / error** | Loading: during getImportHistory. Empty: "No imports yet". Error: message and retry. |

---

## Screen 9: Import Details

| Field | Description |
|-------|-------------|
| **Purpose** | Full run details, error log, download error rows CSV, retry failed rows. |
| **How user reaches it** | From Import History (click run) or from Import Progress ("View details"). |
| **Layout / sections** | Run summary (same as Progress); full error log (table or list: row index, error message); "Download error rows" button; "Retry failed" button. |
| **Main UI elements** | Twigs: Table for error log, Button "Download error rows", Button "Retry failed". |
| **User actions** | **getImportDetails** ({ importId }) on load. "Download error rows": **getErrorRowsDownloadUrl** ({ importId }) → open downloadUrl in new tab or trigger download. "Retry failed": **retryFailedImports** ({ importId }) → show result (toast or inline); optionally refresh details. |
| **Data shown** | getImportDetails: run (full record), errorLog. |
| **Empty / loading / error** | Loading: getImportDetails. Empty error log: hide error section or show "No errors". Error: show API error; retry. |

---

## Additional screens

None for v1. All main flows covered by S1–S9.
