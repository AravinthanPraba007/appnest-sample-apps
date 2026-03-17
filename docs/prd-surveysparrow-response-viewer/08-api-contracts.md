# SurveySparrow Response Viewer — API Contracts

## AppNest contract rules

- Every invokable backend function must be **exported** from `app-backend/server.js`.
- Every such function must be declared in `manifest.json` → **backend_api_functions** with correct name and timeout.
- Handlers receive **`{ payload }`** (and platform-injected context e.g. installation_params). Return a plain object or `ResultData({ body, statusCode })`.
- Frontend calls backend via **`window.appnestClient.backend.invoke({ functionName, payload })`**.

---

## Backend API functions (backend_api_functions)

| Function name | Purpose | Payload (input) | Return / response | Timeout (s) |
|---------------|---------|------------------|-------------------|-------------|
| getSurveys | Fetch all surveys from SurveySparrow. | `{}` or none | `{ surveys: [...] }` or `ResultData({ body, statusCode })`; body contains list of surveys (name, id, created_at, etc.). | 10 |
| getSurveyResponses | Fetch one page of responses for a survey. | `{ surveyId: string, page: number, perPage?: number }` (perPage default 10) | `{ responses: [...], meta: { page, per_page, total } }` or ResultData; on error return 4xx/5xx with message. | 10 |

**manifest.json snippet (backend_api_functions):**

```json
"backend_api_functions": {
  "getSurveys": { "timeout": 10 },
  "getSurveyResponses": { "timeout": 10 }
}
```

---

## Event listeners (event_listener_functions)

None. No platform events are subscribed.

**manifest.json snippet (event_listener_functions):**

```json
"event_listener_functions": {}
```

(or omit if empty per manifest schema.)

---

## Installation params (installation_params)

| Param key | display_name | type | required | secure | Description |
|-----------|--------------|------|----------|--------|-------------|
| survey_sparrow_api_key | SurveySparrow API Key | product_api_key or text | Yes | true (secure) | API key for SurveySparrow Public API. Used only in backend. |
| survey_sparrow_base_url | SurveySparrow API Base URL (optional) | text | No | false | Base URL (e.g. https://api.surveysparrow.com). Default: https://api.surveysparrow.com. |

---

## OAuth config (if applicable)

Not used.

---

## Whitelisted domains

- SurveySparrow API: allow the domain(s) the backend calls. Examples:
  - `https://api\.surveysparrow\.com.*`
  - If supporting multiple regions: `https://.*\.surveysparrow\.com.*` (covers api.surveysparrow.com, eu-api.surveysparrow.com, ap-api.surveysparrow.com, etc.)

(List all regex patterns for external hosts the app calls.)

---

## Scheduled jobs ($schedule)

Not used.

---

## Function chaining ($next)

Not used.
