# CSV Response Importer — Feature Requirements

## Core features (v1)

| ID | Feature | Description | Priority | Acceptance criteria |
|----|---------|-------------|----------|---------------------|
| F1 | API authentication | User provides SurveySparrow API token; app validates with API. | Must have | Token stored via installation_params; backend uses it for all $http calls to SurveySparrow. |
| F2 | Fetch surveys | Load list of surveys from SurveySparrow. | Must have | Backend getSurveys calls GET /v3/surveys; UI shows survey name, ID, status. |
| F3 | Survey question fetch | Load survey details and questions for mapping. | Must have | Backend getSurveyDetails calls GET /v3/surveys/{survey_id}; UI shows questions with IDs for mapping. |
| F4 | CSV upload and parsing | Accept .csv; parse headers (max file size e.g. 10MB). | Must have | Frontend accepts .csv; parses headers; displays columns for mapping. |
| F5 | Column mapping | Map CSV columns to survey questions. | Must have | UI shows CSV column ↔ survey question; user selects mapping; payload sent to backend. |
| F6 | Response submission | Submit each row (or batch) to SurveySparrow. | Must have | Backend submitResponses calls POST /v3/surveys/{survey_id}/responses; retries up to 3 on failure. |
| F7 | Import status and report | Show progress and final summary. | Must have | Display total processed, successful imports, failed rows, and error messages. |
| F8 | Import run history | List past import runs with metadata. | Must have | Backend listImportRuns; UI shows run date/time, survey name, total/success/failed counts, status; pagination/filters (e.g. by survey, date). |
| F9 | Run detail + CSV download | View single run and download the CSV used. | Must have | Backend getImportRun returns run metadata + CSV download URL ($file.getDownloadUrl); UI has “Download CSV” per run. |
| F10 | Global timezone + submission created time | Set timezone and optional submission timestamp for imports. | Must have | Global (or per-run) timezone selector (e.g. IANA); optional “submission created time” (datetime + timezone). Pass to API when supported; else store on run for audit and display. |

## Configuration / settings

- **surveysparrow_api_key** (installation_param): SurveySparrow API key; type api_key, required, secure. Used by all backend $http calls.
- **Timezone / submission time:** Stored per workspace (e.g. $db key `settings_{{workspaceId}}`) or as default in run payload: `timezone` (IANA string), `submissionCreatedTime` (ISO datetime or null for “use current time”). UI: global settings panel or step before mapping.

## Platform events (if any)

None. This app is API-driven only (user-triggered flows via UI → backend invoke).

## UI surface

- **Full-page app:** Yes. UI is built in `app-frontend/src/App.jsx` and child components; use `@sparrowengg/twigs-react` and `@sparrowengg/twigs-react-icons`.
- **Custom installation frontend:** No for v1 (use default installation).

## Out of scope (v1)

- Custom installation UI; scheduled/automated imports; webhooks; editing/deleting imported responses; batch size > 10,000 per run; re-run failed only; export history; delete/archive runs. See [Additional flows](11-additional-flows-and-future-cases.md).
