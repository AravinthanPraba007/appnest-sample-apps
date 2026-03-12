# CSV Response Importer — API Contracts

## AppNest contract rules

- Every invokable backend function must be **exported** from `app-backend/server.js`.
- Every such function must be declared in `manifest.json`: **API** → `backend_api_functions` with correct `timeout`.
- Handlers receive **`{ payload }`**. Return a plain object or `ResultData({ body, statusCode })`.
- Frontend calls backend via **`window.appnestClient.backend.invoke({ functionName, payload })`**.

---

## Backend API functions (backend_api_functions)

| Function name | Purpose | Payload (input) | Return / response | Timeout (s) |
|---------------|---------|------------------|-------------------|-------------|
| getSurveys | Fetch list of surveys from SurveySparrow API. | `{}` or `{ page?, limit? }` | `{ surveys: [...] }` or ResultData | 15 |
| getSurveyQuestions | Fetch questions for a survey (for column mapping). | `{ surveyId, surveyVersion? }` | `{ questions: [...] }` or ResultData | 15 |
| getCsvUploadUrl | Get signed upload URL for CSV file for a new import. | `{ importId }` (client generates or backend returns new importId) | `{ uploadUrl, path, importId? }` | 10 |
| validateCsv | Validate uploaded CSV: format, headers, mandatory fields; optional row sampling. | `{ path }` or `{ importId }` (path from run or from getCsvUploadUrl) | `{ valid, errors?: [...], headers?: [...] }` | 30 |
| saveColumnMapping | Save CSV column → survey question mapping for an import. | `{ importId, surveyId, mappings: [{ csvColumn, questionId }] }` | `{ success: true }` or ResultData | 10 |
| startImport | Create import run, persist config, kick off first chunk via $next. | `{ importId, surveyId, filePath, mapping?, config: { timestampSource, timezone, duplicateRule } }` | `{ importId, status: 'processing' }` or ResultData | 20 |
| processImportChunk | Process one chunk of CSV rows; call SurveySparrow submission API; on completion schedule next chunk or mark run complete. | `{ importId, offset, limit }` (from $next) | plain object (internal) or ResultData | 120 |
| getImportStatus | Get current status and counts for an import run. | `{ importId }` | `{ status, totalRows, successCount, failureCount, startedAt, completedAt? }` | 10 |
| getImportHistory | List import runs for workspace (paginated). | `{ limit?, offset?, surveyId? }` | `{ runs: [...], total? }` | 15 |
| getImportDetails | Full run details including error log. | `{ importId }` | `{ run: {...}, errorLog: [...] }` | 10 |
| getErrorRowsDownloadUrl | Get signed download URL for error rows CSV. | `{ importId }` | `{ downloadUrl }` or 404 if no errors | 10 |
| retryFailedImports | Retry failed rows for a run (re-read error rows or failed indices, resubmit). | `{ importId }` | `{ success, retriedCount?, newFailures? }` or ResultData | 120 |

**manifest.json snippet (backend_api_functions):**

```json
"backend_api_functions": {
  "getSurveys": { "timeout": 15 },
  "getSurveyQuestions": { "timeout": 15 },
  "getCsvUploadUrl": { "timeout": 10 },
  "validateCsv": { "timeout": 30 },
  "saveColumnMapping": { "timeout": 10 },
  "startImport": { "timeout": 20 },
  "processImportChunk": { "timeout": 120 },
  "getImportStatus": { "timeout": 10 },
  "getImportHistory": { "timeout": 15 },
  "getImportDetails": { "timeout": 10 },
  "getErrorRowsDownloadUrl": { "timeout": 10 },
  "retryFailedImports": { "timeout": 120 }
}
```

---

## Event listeners (event_listener_functions)

None for v1.

**manifest.json snippet (event_listener_functions):**

```json
"event_listener_functions": {}
```

---

## Installation params (installation_params)

| Param key | display_name | type | required | secure | Description |
|-----------|--------------|------|----------|--------|-------------|
| surveysparrow_api_key | SurveySparrow API Key | product_api_key or text | true | true | API token for SurveySparrow Public API. |

---

## OAuth config (if applicable)

Not used in v1.

---

## Whitelisted domains

- SurveySparrow API base (e.g. `https://api.surveysparrow.com`). Use regex pattern that matches the API host, e.g. `https://api\\.surveysparrow\\.com.*` or as per platform convention.

---

## Scheduled jobs ($schedule)

Not used in v1. Chunked processing is done via **$next** (processImportChunk chained by startImport and by processImportChunk itself for next chunk).

---

## Function chaining ($next)

| Caller function | Target function | Payload shape | Delay (s) | Notes |
|-----------------|-----------------|---------------|-----------|--------|
| startImport | processImportChunk | `{ importId, offset: 0, limit: CHUNK_SIZE }` | 0 | After creating run record and saving config. |
| processImportChunk | processImportChunk | `{ importId, offset: nextOffset, limit: CHUNK_SIZE }` | 0 | When more rows remain; else update run status to completed/failed. |

- CHUNK_SIZE is a constant (e.g. 100 or 500) to stay within timeout and rate limits.
- If SurveySparrow returns 429, processImportChunk should retry with backoff (and optionally re-invoke self with delay) before calling $next for next chunk.
