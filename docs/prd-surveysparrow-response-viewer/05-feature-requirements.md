# SurveySparrow Response Viewer — Feature Requirements

## Core features (v1)

| ID | Feature | Description | Priority | Acceptance criteria |
|----|---------|-------------|----------|---------------------|
| F1 | Survey listing | Display all surveys from SurveySparrow account. | Must have | Backend calls GET /v3/surveys; UI shows survey name, ID, created date, and “View Responses” per survey. |
| F2 | Survey selection | User selects a survey to view its responses. | Must have | Selected survey ID is stored; app navigates to Response Viewer and fetches first page of responses. |
| F3 | Fetch survey submissions | Load responses for the selected survey with pagination. | Must have | Backend calls GET /v3/surveys/{survey_id}/responses?page=N&per_page=10; returns response data to frontend. |
| F4 | Response viewer | Display submissions in a structured, readable format. | Must have | Each response shows response ID, respondent info if available, submission date, and Q/A pairs. |
| F5 | Pagination | Browse responses 10 per page with Previous/Next and page indicator. | Must have | Controls for Previous, Next, and “Page X of N”; clicking them fetches the corresponding page. |

## Configuration / settings

- **SurveySparrow API key:** Stored as an installation_param (e.g. `survey_sparrow_api_key`, type `secure` or product_api_key). Used only in backend; never sent to frontend.
- **SurveySparrow API base URL (optional):** If supporting multiple regions (US, EU, AP, etc.), an installation_param for base URL (e.g. `survey_sparrow_base_url`) can be added; default https://api.surveysparrow.com.

(These map to `installation_params` in `manifest.json`.)

## Platform events (if any)

None. App is entirely UI-driven via backend API functions.

## UI surface

- **Full-page app:** Yes. UI is built in `app-frontend/src/App.jsx` and child components; use `@sparrowengg/twigs-react` and `@sparrowengg/twigs-react-icons` for components and icons.
- **Custom installation frontend:** No (use standard app frontend only).

## Out of scope (v1)

- Export (CSV/Excel), filtering/search within responses, editing or creating surveys/responses, OAuth, caching responses in $db.
