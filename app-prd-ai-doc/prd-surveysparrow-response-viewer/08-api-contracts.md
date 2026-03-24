# SurveySparrow Response Viewer — API Contracts

## AppNest contract rules

- Every invokable backend function must be **exported** from `app-backend/server.js`.
- Every such function must be declared in `manifest.json`: **API** → `backend_api_functions` with `timeout`.
- Handlers receive **`{ payload }`**. Return a plain object or `ResultData({ body, statusCode })`.
- Frontend calls backend via **`window.appnestClient.backend.invoke({ functionName, payload })`**.

---

## Backend API functions (backend_api_functions)

| Function name | Purpose | Payload (input) | Return / response | Timeout (s) |
|---------------|---------|------------------|-------------------|-------------|
| getSurveys | Return cached survey list from $db | {} | { surveys: [...], lastSync?: string } | 10 |
| syncSurveys | Fetch surveys from SurveySparrow API via $http; update $db cache | {} | { success: true, count: number } or error | 30 |
| getResponses | Fetch one page of responses for a survey from API | { surveyId: string, page: number, per_page?: number } | { data: [...], meta: { page, per_page, total } } or error | 15 |
| listBackups | List backup files from $file (backups/...) | {} | { files: [{ name, path, size? }] } | 10 |
| getBackupDownloadUrl | Get download URL for a backup file via $file | { path: string } | { url: string } or error | 10 |
| runScheduledBackup | (Optional) Create backup file for today's responses; used by $schedule or manual trigger | {} or { surveyIds?: string[] } | { success: true, path: string } or error | 60 |

**manifest.json snippet (backend_api_functions):**

```json
"backend_api_functions": {
  "getSurveys": { "timeout": 10 },
  "syncSurveys": { "timeout": 30 },
  "getResponses": { "timeout": 15 },
  "listBackups": { "timeout": 10 },
  "getBackupDownloadUrl": { "timeout": 10 },
  "runScheduledBackup": { "timeout": 60 }
}
```

---

## Event listeners (event_listener_functions)

None for v1. No platform events subscribed.

**manifest.json snippet (event_listener_functions):**

```json
"event_listener_functions": {}
```

(or omit if manifest schema allows.)

---

## Installation params (installation_params)

| Param key | display_name | type | required | secure | Description |
|-----------|--------------|------|----------|--------|-------------|
| surveysparrow_api_key | SurveySparrow API Key | api_key or text | true | true | API key for SurveySparrow Public API. Find in Settings → Apps & Integrations. Used by backend only. |

---

## OAuth config (if applicable)

Not used. No OAuth.

---

## Whitelisted domains

- `https://api\.surveysparrow\.com(/.*)?` — SurveySparrow Public API. All outbound $http calls go here.

---

## Scheduled jobs ($schedule)

Optional for v1: one recurring job to run response backup daily.

| Job name | Type | Target function | Schedule (runAt / cronExpression / repeat) | Notes |
|----------|------|------------------|--------------------------------------------|--------|
| dailyResponseBackup | CRON or RECURRING | runScheduledBackup | e.g. daily at 02:00 or repeat every 24h | Writes backup file to $file (backups/responses_YYYY_MM_DD.json). |

If the app does **not** use $schedule in v1, write *Not used* and omit the job; runScheduledBackup can still be invokable manually.

---

## Function chaining ($next)

Not used.
