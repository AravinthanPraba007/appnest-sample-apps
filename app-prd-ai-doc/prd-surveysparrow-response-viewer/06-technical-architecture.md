# SurveySparrow Response Viewer — Technical Architecture

## AppNest alignment (mandatory)

This app follows the AppNest framework. Reference: `appnest-tools/appnest-governance/` (entry points, SDK, manifest, UI libraries).

### Backend

- **Single entry:** `app-backend/server.js`. Only **exported** functions are invokable (as API or event handlers).
- **No Express/routes:** The framework provides routing. Implement handlers in separate files (e.g. `controller/*.js`, `helpers/*.js`) and re-export from `server.js`.
- **All I/O via AppNest SDK:** Use `$db` for survey cache and metadata; `$http` for SurveySparrow API (GET surveys, GET responses); `$file` for backup files (list, get download URL). Do **not** use axios/fetch or raw DB clients.
- **Do not add** `@aravinthan_p/appnest-app-sdk-utils` to `app-backend/package.json`; the SDK is provided by the platform at runtime.
- **Handlers** receive `{ payload }` and return a plain object or `ResultData({ body, statusCode })` for HTTP-style responses.

### Frontend

- **Stack:** React; React and react-dom are provided by the platform.
- **Single entry:** `app-frontend/src/App.jsx` is the root component loaded by the framework.
- **Backend calls:** Use `window.appnestClient.backend.invoke({ functionName, payload })`. `functionName` must match an export from `app-backend/server.js` and a key in `manifest.json` → `backend_api_functions`.
- **Do not add** `react` or `react-dom` to `app-frontend/package.json`; they are provided by the platform.
- **UI components:** Use **`@sparrowengg/twigs-react`** and **`@sparrowengg/twigs-react-icons`** (version **`"*"`** in package.json). Twigs is SurveySparrow's component library.

### Manifest

- **backend_api_functions:** getSurveys, syncSurveys, getResponses, listBackups, getBackupDownloadUrl (and optionally runScheduledBackup if using $schedule); each with timeout.
- **event_listener_functions:** None for v1.
- **whitelisted_domains:** SurveySparrow API domain (e.g. `https://api\.surveysparrow\.com(/.*)?`).
- **installation_params:** surveysparrow_api_key (secure) for backend-only API calls.

---

## High-level architecture

- **Frontend (app-frontend):** React app; Survey List screen (getSurveys, syncSurveys), Response Viewer screen (getResponses with pagination), Backup Files screen (listBackups, getBackupDownloadUrl). All HTTP to SurveySparrow is via backend.
- **Backend (app-backend):** Exported functions call SurveySparrow via `$http` using API key from installation_params; read/write survey cache and metadata via `$db`; list and serve backup files via `$file`. Optional: $schedule job to run periodic backup (writes to $file).

## Backend layout

```
app-backend/
├── server.js              # Entry: exports getSurveys, syncSurveys, getResponses, listBackups, getBackupDownloadUrl [, runScheduledBackup]
├── controller/            # (optional) surveyController, responseController, backupController
├── helpers/               # (optional) apiClient for $http to SurveySparrow
├── constants/             # (optional) API base URL, key names
└── package.json           # App-specific deps only; NOT the AppNest SDK
```

## Frontend layout

```
app-frontend/
└── src/
    ├── App.jsx            # Entry: routing / screens (Survey List, Response Viewer, Backup Files)
    ├── components/        # SurveyList, ResponseViewer, BackupFiles, Pagination, etc.
    ├── contexts/          # (optional) selected survey, pagination state
    ├── hooks/             # (optional) useBackendInvoke
    ├── services/          # (optional) client wrapper for invoke
    ├── utils/
    │   └── client.js      # getClient() for Appnest client if needed
    └── css/
```

## External dependencies

- **SurveySparrow Public API:** GET /v3/surveys, GET /v3/surveys/{survey_id}/responses. All calls from backend via `$http`; API key from installation_params. Whitelist: api.surveysparrow.com.

## Security and secrets

- No hardcoded secrets. SurveySparrow API key only in **installation_params** (secure). See `appnest-tools/appnest-governance/03-integration-standards/07-External-API-Standards.md`.
