# {{product_name}} — Technical Architecture

## AppNest alignment (mandatory)

This app follows the AppNest framework. Reference: `appnest-tools/appnest-governance/` (entry points, **Appnest Functions**, manifest, UI libraries).

### Backend

- **Single entry:** `app-backend/server.js`. Only **exported** functions are invokable (as API or event handlers).
- **No Express/routes:** The framework provides routing. Implement handlers in separate files (e.g. `controller/*.js`, `eventHandler.js`) and re-export from `server.js`.
- **All I/O via Appnest Functions (backend):** Use `$db` for persistence, `$fetch.request` for outbound HTTP, `$file` for files, `$next` for invoking other functions, `$schedule` for scheduled jobs; use `getTraceId()` for request correlation/logging where needed. Do **not** use axios/fetch or raw DB clients. See **`appnest-functions/Backend-Appnest-Functions.md`** in governance for the full API.
- **Do not add** `@sparrowengg/appnest-app-sdk-utils` to `app-backend/package.json`; **Appnest Functions** are provided by the platform at runtime (import `AppnestFunctions` from that package in code only—do not list it as a dependency).
- **Handlers** receive `{ payload }` and return a plain object or `ResultData({ body, statusCode })` for HTTP-style responses.

### Frontend

- **Stack:** The frontend is a **React** application; React and react-dom are provided by the platform.
- **Single entry:** `app-frontend/src/App.jsx` is the root component loaded by the framework.
- **Backend calls:** Use `window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })`. `apiFunctionName` must match an export from `app-backend/server.js` and a key in `manifest.json` → `backend_api_functions`.
- **Do not add** `react` or `react-dom` to `app-frontend/package.json`; they are provided by the platform.
- **UI components:** Use **`@sparrowengg/twigs-react`** (React UI components) and **`@sparrowengg/twigs-react-icons`** (SVG icons). Add these to `app-frontend/package.json` when building UI with version **`"*"`** (latest)—do not pin to versions like `^2.0.0` that may not exist. Twigs is SurveySparrow’s themeable, customisable, and fully accessible component library.

### Manifest

- **backend_api_functions:** Every API-invokable function name must match an export from `server.js`; include `timeout` where needed.
- **event_listener_functions:** Every platform event must map `handler` to a function name exported from `server.js`.
- **whitelisted_domains:** Include all external API and OAuth domains (regex patterns).
- **installation_params:** All installation-time config (API keys, URLs, etc.); use `product_api_key`, `text`, `secure` as per schema.
- **oauth_config:** If the app uses OAuth, declare provider(s) with `client_id`, `client_secret`, `authorize_url`, `token_url`, `options` (e.g. scope).

---

## High-level architecture

{{architecture_diagram_or_description}}

## Backend layout

```
app-backend/
├── server.js              # Entry: exports all invokable functions
├── controller/            # (optional) API/domain logic
├── helpers/               # (optional) shared helpers
├── constants/             # (optional) config and constants
└── package.json           # Only app-specific deps (e.g. mssql); NOT `@sparrowengg/appnest-app-sdk-utils` (Appnest Functions)
```

## Frontend layout

```
app-frontend/
└── src/
    ├── App.jsx            # Entry: root component
    ├── components/
    ├── contexts/
    ├── hooks/
    ├── services/
    ├── utils/
    │   └── client.js      # getClient() for Appnest client if needed
    └── css/
```

## External dependencies

{{external_dependencies}}

## Security and secrets

- No hardcoded secrets. Use **installation_params** (e.g. product_api_key, secure text) or **oauth_config** only. See `appnest-tools/appnest-governance/Code-Review-and-AI-Generation-Checklist.md` (External API — secrets).
