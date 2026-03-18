# SurveySparrow → Slack Response Sender — API Contracts

## AppNest contract rules

- Every invokable backend function is **exported** from `app-backend/server.js`.
- Declared in `manifest.json` → `backend_api_functions`.
- Handlers receive **`{ payload }`**. Return `ResultData({ body, statusCode })` or plain object.
- Frontend: **`window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })`**.

---

## Backend API functions (backend_api_functions)

| Function name | Purpose | Payload (input) | Return / response | Timeout (s) |
|---------------|---------|------------------|-------------------|-------------|
| `listSurveys` | Fetch surveys from SurveySparrow using install token | `{}` (optional empty) | `{ surveys: [{ id, name }] }` aligned with API | 30 |
| `sendLatestResponsesToSlack` | Fetch latest 5 responses, format, POST to Slack | `{ surveyId: string, slackWebhookUrl: string }` | `{ ok: true, message: string }` or 4xx body | 60 |

**Expected SurveySparrow shapes (logical):**

- List: `[{ id, name }]` or wrapped object per API.
- Responses: `{ responses: [{ respondent, answers: [{ question, answer }] }] }` — map actual API fields in implementation.

**manifest.json snippet (backend_api_functions):**

```json
"backend_api_functions": {
  "listSurveys": { "timeout": 30 },
  "sendLatestResponsesToSlack": { "timeout": 60 }
}
```

---

## Event listeners (event_listener_functions)

*Not used in v1.*

| Event name | Handler (export name) | Payload shape | Notes |
|------------|------------------------|---------------|-------|
| — | — | — | **N/A** |

**manifest.json snippet:**

```json
"event_listener_functions": {}
```

---

## Installation params (installation_params)

| Param key | display_name | type | required | secure | Description |
|-----------|--------------|------|----------|--------|-------------|
| `surveysparrow_api_token` | SurveySparrow API token | secure (or product_api_key per schema) | yes | yes | Bearer token for SurveySparrow API |

---

## OAuth config (if applicable)

*Not used in v1.* Token-based auth only.

| Provider key | Purpose | scope / options |
|--------------|---------|-----------------|
| — | — | **N/A** |

---

## Whitelisted domains

Include regex patterns for:

- **SurveySparrow API** — e.g. `^https://api\\.surveysparrow\\.com/.*` (confirm exact host/version with SurveySparrow docs at implementation).
- **Slack** — `^https://hooks\\.slack\\.com/services/.*`

---

## Scheduled jobs ($schedule)

*Not used.*

---

## Function chaining ($next)

*Not used.*
