# SurveySparrow Response Viewer — Technical Architecture

## AppNest alignment (mandatory)

This app follows the AppNest framework. Reference: `appnest-tools/appnest-governance/` (entry points, SDK, manifest, UI libraries).

### Backend

- **Single entry:** `app-backend/server.js`. Only **exported** functions are invokable (as API or event handlers).
- **No Express/routes:** The framework provides routing. Implement handlers in separate files (e.g. `surveyController.js` or `apiFunction.js`) and re-export from `server.js`.
- **All I/O via AppNest SDK:** Use `$http` for SurveySparrow API calls (no axios/fetch). No persistent storage required for v1; do not use $db for survey/response data unless added in a later phase. Do **not** use axios/fetch or raw DB clients.
- **Do not add** `@aravinthan_p/appnest-app-sdk-utils` to `app-backend/package.json`; the SDK is provided by the platform at runtime.
- **Handlers** receive `{ payload }` and return a plain object or `ResultData({ body, statusCode })` for HTTP-style responses. Use installation_params (e.g. API key) injected by the platform; never hardcode secrets.

### Frontend

- **Single entry:** `app-frontend/src/App.jsx` is the root component loaded by the framework.
- **Backend calls:** Use `window.appnestClient.backend.invoke({ functionName, payload })`. `functionName` must match an export from `app-backend/server.js` and a key in `manifest.json` → `backend_api_functions`. No direct SurveySparrow API calls from frontend.
- **Do not add** `react` or `react-dom` to `app-frontend/package.json`; they are provided by the platform.
- **UI components:** Use **`@sparrowengg/twigs-react`** and **`@sparrowengg/twigs-react-icons`**. Add these to `app-frontend/package.json` when building UI.

### Manifest

- **backend_api_functions:** `getSurveys`, `getSurveyResponses` with timeouts (e.g. 10s).
- **event_listener_functions:** None.
- **whitelisted_domains:** Regex patterns for SurveySparrow API (e.g. `https://api\.surveysparrow\.com.*`, and if supporting regions: `https://.*\.surveysparrow\.com.*`).
- **installation_params:** SurveySparrow API key (e.g. `survey_sparrow_api_key`, secure); optionally base URL.
- **oauth_config:** Not used.

---

## High-level architecture

- **Frontend (App.jsx):** Renders Survey List screen; on “View Responses” navigates to Response Viewer (same app, state or route). Calls `getSurveys` and `getSurveyResponses(surveyId, page, perPage)` via `window.appnestClient.backend.invoke`.
- **Backend (server.js):** Exports `getSurveys` and `getSurveyResponses`. Each uses $http to call SurveySparrow Public API (GET /v3/surveys and GET /v3/surveys/{id}/responses). API key and optional base URL come from installation_params. Returns JSON to frontend.
- **External:** SurveySparrow Public API only. No $db, $file, $schedule, or $next for v1.

## Backend layout

```
app-backend/
├── server.js              # Entry: exports getSurveys, getSurveyResponses
├── surveyController.js    # (optional) or in apiFunction.js: $http calls to SurveySparrow
└── package.json           # Only app-specific deps; NOT the AppNest SDK
```

## Frontend layout

```
app-frontend/
└── src/
    ├── App.jsx            # Entry: root; Survey List + Response Viewer (state or simple routing)
    ├── components/        # SurveyList, ResponseViewer, Pagination, etc.
    ├── css/
    └── package.json       # twigs-react, twigs-react-icons; NOT react/react-dom
```

## External dependencies

- **SurveySparrow Public API:** GET /v3/surveys, GET /v3/surveys/{survey_id}/responses?page=&per_page=. Base URL from installation or default https://api.surveysparrow.com. All calls via backend $http.

## Security and secrets

- API key stored only in **installation_params** (secure). Backend reads it from payload/context provided by platform; never exposed to frontend. See `appnest-tools/appnest-governance/03-integration-standards/07-External-API-Standards.md`.
