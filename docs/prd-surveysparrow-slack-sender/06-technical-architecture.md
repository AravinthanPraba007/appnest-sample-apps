# SurveySparrow → Slack Response Sender — Technical Architecture

## AppNest alignment (mandatory)

This app follows the AppNest framework. Reference: `appnest-tools/appnest-governance/` (entry points, SDK, manifest, UI libraries).

### Backend

- **Single entry:** `app-backend/server.js`. Only **exported** functions are invokable.
- **No Express/routes:** Handlers in modules (e.g. `controller/surveySparrow.js`) re-exported from `server.js`.
- **All I/O via AppNest SDK:** SurveySparrow and Slack calls use **`$http`**. **No `$db` in v1** (stateless per request). No axios/fetch.
- **Do not add** `@aravinthan_p/appnest-app-sdk-utils` to `app-backend/package.json`.
- **Handlers** return `ResultData({ body, statusCode })` for errors (4xx/5xx semantics) or plain success objects.

### Frontend

- **Stack:** React provided by platform.
- **Single entry:** `app-frontend/src/App.jsx`.
- **Backend calls:** `window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })` for `listSurveys`, `sendLatestResponsesToSlack`.
- **Do not add** `react` / `react-dom` to `app-frontend/package.json`.
- **UI:** `@sparrowengg/twigs-react` + `@sparrowengg/twigs-react-icons` at version **`"*"`**.

### Manifest

- **backend_api_functions:** `listSurveys`, `sendLatestResponsesToSlack`.
- **event_listener_functions:** *None* (omit or empty per manifest rules).
- **whitelisted_domains:** SurveySparrow API host + `hooks.slack.com`.
- **installation_params:** Secure API token for SurveySparrow.

---

## High-level architecture

```
[App.jsx] --invoke--> [server.js]
                          |
                    listSurveys --> $http --> SurveySparrow GET /surveys
                    sendLatestResponsesToSlack --> $http --> SurveySparrow GET .../responses?limit=5
                                                      --> $http --> Slack POST webhook { text }
```

Token read from installation context (never from client payload for SurveySparrow). Webhook URL only in client payload for send.

## Backend layout

```
app-backend/
├── server.js
├── controller/
│   └── surveySlack.js    # SurveySparrow + Slack helpers using $http
├── constants/
│   └── index.js          # Path templates (align with SurveySparrow API version)
└── package.json          # No AppNest SDK
```

## Frontend layout

```
app-frontend/
└── src/
    ├── App.jsx
    ├── services/
    │   └── api.js        # invoke wrappers
    └── (components as needed)
```

## External dependencies

| System | Usage |
|--------|--------|
| SurveySparrow Public API | List surveys; list responses (limit 5). Exact paths follow official docs (e.g. base `https://api.surveysparrow.com` + versioned routes). |
| Slack Incoming Webhooks | POST JSON `{ "text": "..." }` to user-provided URL. |

## Security and secrets

- SurveySparrow token: **installation_params** only (secure).
- Slack webhook: supplied per send in payload; **never log** full URL; optional mask in any client-side status (e.g. show last 4 chars only if ever needed).
