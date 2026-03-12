# CSV Response Importer — Technical Architecture

## AppNest alignment (mandatory)

This app follows the AppNest framework. Reference: `appnest-tools/appnest-governance/` (entry points, SDK, manifest, UI libraries).

### Backend

- **Single entry:** `app-backend/server.js`. Only **exported** functions are invokable: getSurveys, getSurveyDetails, submitResponses, listImportRuns, getImportRun, saveSettings, getSettings.
- **No Express/routes:** The framework provides routing. Implement handlers in separate files (e.g. controller or helpers) and re-export from `server.js`.
- **All I/O via AppNest SDK:** Use `$http` for SurveySparrow API; `$db` for import_run metadata and settings; `$file` for storing and serving CSV per run (write on submit, getDownloadUrl in getImportRun). Do **not** use axios/fetch or raw DB clients.
- **Do not add** `@aravinthan_p/appnest-app-sdk-utils` to `app-backend/package.json`; the SDK is provided by the platform at runtime.
- **Handlers** receive `{ payload }` and return a plain object or `ResultData({ body, statusCode })` for HTTP-style responses.

### Frontend

- **Single entry:** `app-frontend/src/App.jsx` is the root component loaded by the framework.
- **Backend calls:** Use `window.appnestClient.backend.invoke({ functionName, payload })`. functionName: getSurveys, getSurveyDetails, submitResponses, listImportRuns, getImportRun, saveSettings, getSettings (each in `manifest.json` → backend_api_functions).
- **Do not add** `react` or `react-dom` to `app-frontend/package.json`; they are provided by the platform.
- **UI components:** Use **`@sparrowengg/twigs-react`** and **`@sparrowengg/twigs-react-icons`**. Add these to `app-frontend/package.json` when building UI.

### Manifest

- **backend_api_functions:** getSurveys (15), getSurveyDetails (15), submitResponses (60), listImportRuns (15), getImportRun (15), saveSettings (5), getSettings (5).
- **event_listener_functions:** None.
- **whitelisted_domains:** `https://api\.surveysparrow\.com(/.*)?`
- **installation_params:** surveysparrow_api_key (api_key, required, secure).
- **oauth_config:** Not used.

---

## High-level architecture

- **User** → Frontend (App.jsx: auth, survey select, CSV upload, timezone/submission time, mapping, progress, report, **import history** with CSV download).
- **Frontend** → `appnestClient.backend.invoke({ functionName, payload })` → **Backend** (server.js).
- **Backend** → `$http` (SurveySparrow), `$db` (import_run, settings), `$file` (store CSV per run, getDownloadUrl).
- API key from installation context; run metadata and CSV stored in $db and $file for history and download.

## Backend layout

```
app-backend/
├── server.js              # Entry: exports getSurveys, getSurveyDetails, submitResponses, listImportRuns, getImportRun, saveSettings, getSettings
├── controller/            # (optional) e.g. surveysController.js, importController.js
├── helpers/               # (optional) e.g. httpHelpers for $http + retries
└── package.json           # Only app-specific deps; NOT the AppNest SDK
```

## Frontend layout

```
app-frontend/
└── src/
    ├── App.jsx            # Entry: root; steps: auth → survey select → upload → timezone/settings → mapping → progress → report; plus ImportHistory, RunDetail
    ├── components/        # AuthPage, SurveySelector, CsvUpload, ColumnMapping, ImportProgress, ImportReport, ImportHistory, RunDetail, SettingsPanel (timezone, submission time)
    ├── services/          # invoke getSurveys, getSurveyDetails, submitResponses via appnestClient
    ├── utils/
    │   └── client.js      # getClient() for Appnest client if needed
    └── css/
```

## External dependencies

- **SurveySparrow Public API:** All calls via backend $http. Endpoints: GET /v3/surveys, GET /v3/surveys/{survey_id}, POST /v3/surveys/{survey_id}/responses. Authentication via installation param (API key). Retries and 429 handling per 09-non-functional-requirements.

## Security and secrets

- No hardcoded secrets. Use **installation_params** (surveysparrow_api_key) only. See `appnest-tools/appnest-governance/03-integration-standards/07-External-API-Standards.md`.
