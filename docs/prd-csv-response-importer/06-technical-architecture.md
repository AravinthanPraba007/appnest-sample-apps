# CSV Response Importer — Technical Architecture

## AppNest alignment (mandatory)

This app follows the AppNest framework. Reference: `appnest-tools/appnest-governance/` (entry points, SDK, manifest, UI libraries).

### Backend

- **Single entry:** `app-backend/server.js`. Only **exported** functions are invokable (as API or event handlers).
- **No Express/routes:** The framework provides routing. Implement handlers in separate files (e.g. `controller/*.js`, `helpers/*.js`) and re-export from `server.js`.
- **All I/O via AppNest SDK:** Use `$db` for persistence, `$http` for SurveySparrow API, `$file` for CSV upload/download and error files, `$next` for chunked import processing. Do **not** use axios/fetch or raw DB clients.
- **Do not add** `@aravinthan_p/appnest-app-sdk-utils` to `app-backend/package.json`; the SDK is provided by the platform at runtime.
- **Handlers** receive `{ payload }` and return a plain object or `ResultData({ body, statusCode })` for HTTP-style responses.

### Frontend

- **Single entry:** `app-frontend/src/App.jsx` is the root component loaded by the framework.
- **Backend calls:** Use `window.appnestClient.backend.invoke({ functionName, payload })`. `functionName` must match an export from `app-backend/server.js` and a key in `manifest.json` → `backend_api_functions`.
- **Do not add** `react` or `react-dom` to `app-frontend/package.json`; they are provided by the platform.
- **UI components:** Use **`@sparrowengg/twigs-react`** and **`@sparrowengg/twigs-react-icons`**. Add these to `app-frontend/package.json` when building UI.

### Manifest

- **backend_api_functions:** Every API-invokable function name must match an export from `server.js`; include `timeout` where needed (longer for startImport, processImportChunk).
- **event_listener_functions:** None for v1.
- **whitelisted_domains:** SurveySparrow API base URL (e.g. `https://api.surveysparrow.com`).
- **installation_params:** SurveySparrow API token (e.g. `surveysparrow_api_key`, type `product_api_key` or `text`, `secure: true`).

---

## High-level architecture

- **Frontend (App.jsx):** Single full-page app; screens: Dashboard, New Import (survey selection, CSV upload, mapping, configuration), Import Progress, Import History, Import Details. All server interaction via `window.appnestClient.backend.invoke`.
- **Backend (server.js):** Exports all invokable functions. SurveySparrow calls use `$http` with token from installation; persistence via `$db`; CSV files via `$file` (getUploadUrl, getDownloadUrl); long-running import via `$next.run` to process chunks (processImportChunk).
- **External:** SurveySparrow Public API (surveys, questions, submissions). No OAuth in v1; token from installation_params.

## Backend layout

```
app-backend/
├── server.js              # Entry: exports all invokable functions
├── controller/
│   ├── surveys.js         # getSurveys, getSurveyQuestions
│   ├── csv.js             # getCsvUploadUrl, validateCsv, saveColumnMapping
│   └── importRun.js       # startImport, processImportChunk, getImportStatus, getImportHistory, getImportDetails, getErrorRowsDownloadUrl, retryFailedImports
├── helpers/
│   ├── surveySparrow.js   # $http wrappers for SurveySparrow API
│   └── csvParser.js       # parse CSV, validate headers/rows
├── constants.js           # API base URL, chunk size, retry config
└── package.json           # Only app-specific deps; NOT the AppNest SDK
```

## Frontend layout

```
app-frontend/
└── src/
    ├── App.jsx            # Entry: root, routing to screens
    ├── components/
    │   ├── Dashboard.jsx
    │   ├── NewImport.jsx
    │   ├── SurveySelection.jsx
    │   ├── CsvUpload.jsx
    │   ├── ColumnMapping.jsx
    │   ├── ImportConfig.jsx
    │   ├── ImportProgress.jsx
    │   ├── ImportHistory.jsx
    │   └── ImportDetails.jsx
    ├── services/
    │   └── api.js         # invoke backend by functionName
    ├── utils/
    │   └── client.js      # getClient() for Appnest client if needed
    └── css/
```

## External dependencies

- **SurveySparrow Public API:** Surveys list, survey questions, submission create. All via `$http` with base URL and auth header from installation (e.g. Bearer token). Document exact endpoints in 08-api-contracts where handlers call them.

## Security and secrets

- No hardcoded secrets. SurveySparrow API token stored only via **installation_params** (e.g. `surveysparrow_api_key`, secure). Use platform replacement (e.g. `<%=iparams.surveysparrow_api_key%>`) in backend when calling SurveySparrow. See `appnest-tools/appnest-governance/03-integration-standards/07-External-API-Standards.md`.
