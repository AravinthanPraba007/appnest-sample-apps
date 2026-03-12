# CSV Response Importer — Milestones

## MVP (v1) scope

- API auth (installation param); fetch surveys; fetch survey details; CSV upload (frontend); **timezone + submission created time** (global or per run); column mapping; submit responses via backend; import progress and report; **import run history** (list + detail); **CSV download** per run.
- Backend: getSurveys, getSurveyDetails, submitResponses (writes $db + $file), listImportRuns, getImportRun (with $file.getDownloadUrl), saveSettings, getSettings. SurveySparrow via $http; run metadata and settings in $db; CSV per run in $file.

**Deliverables:**

- Backend: `app-backend/server.js` exporting getSurveys, getSurveyDetails, submitResponses, listImportRuns, getImportRun, saveSettings, getSettings; handlers use $http, $db, $file; no SDK in package.json.
- Manifest: backend_api_functions (7 functions), installation_params (surveysparrow_api_key), whitelisted_domains; no event_listener_functions.
- Frontend: `app-frontend/src/App.jsx` and components (auth, survey selector, CSV upload, settings/timezone/submission time, mapping, progress, report, import history, run detail with CSV download) using Twigs; backend invoked via `window.appnestClient.backend.invoke`.
- Data: $db for import_run and settings; $file for CSV per run (07-data-model).
- Validation: All items in `appnest-tools/appnest-prd-generator/validation-checklist.md` passed → **READY TO BUILD APP**.

---

## Phase 1 (MVP)

| # | Milestone                         | Dependencies | Done when                                                                 |
|---|-----------------------------------|--------------|----------------------------------------------------------------------------|
| M1 | API auth + getSurveys             | —            | User can enter/use API key; app fetches and displays survey list.          |
| M2 | getSurveyDetails + survey selection | M1         | User selects survey; app fetches and displays questions for mapping.      |
| M3 | CSV upload + column mapping UI    | M2           | User uploads CSV; app shows headers and allows mapping to question IDs.    |
| M4 | submitResponses + import report    | M3           | User confirms; backend submits rows, stores CSV in $file and run in $db; UI shows success/failed counts and errors. |
| M5 | Import run history + CSV download | M4           | listImportRuns and getImportRun; UI shows history list and run detail with “Download CSV” (getDownloadUrl). |
| M6 | Global timezone + submission created time | —         | saveSettings/getSettings; UI for timezone and optional submission created time; pass to submitResponses and store on run. |

---

## Phase 2 (post-MVP)

- Re-run failed rows only; export history as CSV; delete/archive old runs; filters (survey, date, status); save mapping presets; pre-submit validation. See [11-additional-flows-and-future-cases.md](11-additional-flows-and-future-cases.md). Custom installation frontend; scheduled imports; batch > 10k with $schedule/$next; idempotency keys if API supports.

---

## Dependencies and risks

- **SurveySparrow API:** Availability and rate limits; implement retries and clear error reporting.
- **CSV size:** 10MB / 10k rows limit for v1; document and enforce in UI.
