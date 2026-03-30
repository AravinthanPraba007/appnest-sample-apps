# Survey Response CSV Import — API Contracts

## AppNest contract rules

- Every invokable backend function is **exported** from `app-backend/server.js`.
- Declared in `manifest.json` → **`backend_api_functions`** (API) or **`event_listener_functions`** (events).
- Handlers receive **`{ payload }`**; return plain object or `ResultData({ body, statusCode })`.
- Frontend: **`window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })`**.

---

## Backend API functions (backend_api_functions)

| Function name | Purpose | Payload (input) | Return / response | Timeout (s) |
|---------------|---------|------------------|-------------------|-------------|
| `listSurveys` | Fetch surveys for mapping dropdown | `{ page?, limit? }` | `{ surveys: [{ id, name, ... }] }` | 10–15 |
| `getSurveyQuestions` | Load questions/choices for selected survey | `{ surveyId }` | `{ surveyId, questions: [...] }` | 15–20 |
| `ingestCsv` | Accept file reference or base64 chunk per platform; parse; store ingest metadata | `{ fileRef \| uploadToken, options? }` | `{ ingestId, headers, rowCount, previewRows }` | 20 |
| `validateMapping` | Validate mapping against ingest + survey schema | `{ ingestId, surveyId, mapping }` | `{ valid: boolean, errors: [...] }` | 10 |
| `startImportJob` | Create job, snapshot mapping, enqueue first batch | `{ ingestId, surveyId, mapping }` | `{ jobId, initialStatus }` | 15 |
| `processImportBatch` | Process next chunk of rows (invoked via `$next` or directly if small) | `{ jobId, cursor? }` | `{ jobId, done: boolean, nextCursor?, processedDelta }` | 20–60 |
| `getImportJobStatus` | Poll job status and recent failures | `{ jobId, failurePage? }` | `{ status, counts, failures[], ... }` | 10 |
| `cancelImportJob` | Request cancellation | `{ jobId }` | `{ ok: boolean }` | 10 |

**Note:** Exact function split may merge `processImportBatch` into chained internals-only exports if the platform only allows frontend-invoked subset—adjust so **every frontend-called name** remains in manifest; internal batch worker can be a separate export invoked only via `$next`.

**manifest.json snippet (backend_api_functions):**

```json
"backend_api_functions": {
  "listSurveys": { "timeout": 15 },
  "getSurveyQuestions": { "timeout": 20 },
  "ingestCsv": { "timeout": 20 },
  "validateMapping": { "timeout": 10 },
  "startImportJob": { "timeout": 15 },
  "processImportBatch": { "timeout": 60 },
  "getImportJobStatus": { "timeout": 10 },
  "cancelImportJob": { "timeout": 10 }
}
```

---

## Event listeners (event_listener_functions)

**Not used** for v1 core flow. Remove unused `backend_event_functions` / event entries from template `manifest.json` during implementation, or register only handlers that exist.

**manifest.json snippet (event_listener_functions):**

```json
"event_listener_functions": {}
```

---

## Installation params (installation_params)

| Param key | display_name | type | required | secure | Description |
|-----------|--------------|------|----------|--------|-------------|
| `surveysparrow_api_key` | SurveySparrow API Key | `api_key` | yes | yes | API key for public API (or use `data-bind: product.api_key` if platform provides) |

*Strip unrelated template params (Snowflake, extra OAuth) from shipping manifest unless another integration is in scope.*

---

## OAuth config (if applicable)

**Not used** in v1 if API key auth is sufficient. If product later uses OAuth to SurveySparrow, add provider under `oauth_config` and document token refresh in backend.

---

## Whitelisted domains

- `https://api\\.surveysparrow\\.com(/.*)?`

(List all hosts hit by `$fetch`; add staging host if QA uses different base URL.)

---

## Scheduled jobs ($schedule)

**Not used** in v1 unless product adds automatic cleanup of old `$file` artifacts—then document job name, cron, and target function.

---

## Function chaining ($next)

| Caller function | Target function | Payload shape | Delay (s) | Notes |
|-----------------|-----------------|---------------|-----------|--------|
| `startImportJob` | `processImportBatch` | `{ jobId }` | 0 | Kick off first batch |
| `processImportBatch` | `processImportBatch` | `{ jobId, cursor }` | 0–2 | Chain until `done`; respect cancel flag; jitter on 429 |

- If batch completes in one handler invocation for small jobs, `$next` may not fire—logic should still set job terminal state.
