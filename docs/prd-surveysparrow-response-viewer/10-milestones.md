# SurveySparrow Response Viewer — Milestones

## MVP (v1) scope

- Backend: getSurveys and getSurveyResponses implemented; both use $http to call SurveySparrow API; API key from installation_params; no SDK in package.json.
- Manifest: backend_api_functions (getSurveys, getSurveyResponses), installation_params (survey_sparrow_api_key, optional base URL), whitelisted_domains (SurveySparrow); no event_listener_functions.
- Frontend: App.jsx with Survey List and Response Viewer; Twigs only (@sparrowengg/twigs-react, twigs-react-icons); list surveys, “View Responses”, paginated responses (10 per page); backend invoked via window.appnestClient.backend.invoke.
- Data: No $db for v1; all data from API.
- Validation: All items in validation-checklist.md passed → **READY TO BUILD APP**.

**Deliverables:**

- Backend: `app-backend/server.js` exporting getSurveys and getSurveyResponses; handlers implemented using AppNest SDK ($http) only; no SDK in package.json.
- Manifest: `backend_api_functions`, `installation_params`, `whitelisted_domains` complete and consistent with server.js.
- Frontend: `app-frontend/src/App.jsx` and components using Twigs; backend invoked via `window.appnestClient.backend.invoke`.
- Data: No persistent state in $db for v1 (documented in 07-data-model).
- Validation: All items in `appnest-tools/appnest-prd-generator/validation-checklist.md` passed → **READY TO BUILD APP**.

---

## Phase 1 (MVP)

| # | Milestone | Dependencies | Done when |
|---|-----------|--------------|-----------|
| M1 | Backend SurveySparrow proxy | Manifest installation_params, whitelisted_domains | getSurveys and getSurveyResponses implemented; $http with API key; errors return ResultData. |
| M2 | Survey List UI | M1 | Frontend calls getSurveys; displays list (name, ID, date); “View Responses” per survey; Twigs only. |
| M3 | Response Viewer + pagination | M1, M2 | Frontend calls getSurveyResponses(surveyId, page, 10); displays response cards (ID, date, Q/A); Previous/Next and page indicator; empty/loading/error states. |

---

## Phase 2 (post-MVP)

- Optional: caching survey list or responses in $db for performance.
- Optional: filters or search within responses.
- Optional: export (CSV/Excel).
- Optional: OAuth for SurveySparrow if required.

---

## Dependencies and risks

- **Dependency:** SurveySparrow Public API availability and rate limits. Mitigation: retry with backoff on 429; clear error messages for timeout/unauthorized.
- **Risk:** API key misconfiguration. Mitigation: installation_params with secure flag; docs for installer.
