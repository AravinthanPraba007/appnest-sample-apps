# SurveySparrow Response Viewer — Feature Requirements

## Core features (v1)

| ID | Feature | Description | Priority | Acceptance criteria |
|----|---------|-------------|----------|---------------------|
| F1 | Survey listing | Display all available surveys from the account; cache in DB; Sync to refresh from API. | Must have | List shows survey name, ID, created date; View Responses per row; Sync updates cache and list. |
| F2 | Survey selection | User selects a survey to view its responses. | Must have | Selected survey ID is stored; app navigates to response viewer and fetches submissions. |
| F3 | Fetch survey submissions | Retrieve responses for selected survey via SurveySparrow API (paginated). | Must have | GET /v3/surveys/{survey_id}/responses with page and per_page=10; data returned to frontend. |
| F4 | Response viewer | Display submissions in readable format (ID, respondent, date, Q&A pairs). | Must have | Responses in cards or expandable sections; 10 per page. |
| F5 | Pagination | Navigate responses 10 per page with Previous/Next and page indicator. | Must have | Next/Previous and "Page X of N" work; getResponses called with correct page. |
| F6 | Response backup & download | Periodic backup to files; list backups; download backup files. | Must have | Backups stored via $file; list returned by listBackups; user can download via backend-provided URL. |

## Configuration / settings

- **SurveySparrow API key:** Stored as installation_param (secure). Used by backend only for $http calls to SurveySparrow API. No API keys in frontend.

(These map to `installation_params` in `manifest.json`; see 08-api-contracts.)

## Platform events (if any)

None for v1. App is API-driven (user-initiated actions and optional scheduled backup).

## UI surface

- **Full-page app:** Yes. UI is built in `app-frontend/src/App.jsx` and child components; use `@sparrowengg/twigs-react` and `@sparrowengg/twigs-react-icons`.
- **Custom installation frontend:** No (use default installation; no `app-installation-frontend`).

## Out of scope (v1)

- Editing or deleting responses; real-time webhooks from SurveySparrow; multi-workspace/tenant UI; advanced analytics or charts; OAuth; custom installation UI.
