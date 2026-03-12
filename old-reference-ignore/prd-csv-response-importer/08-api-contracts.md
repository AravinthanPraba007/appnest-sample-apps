# CSV Response Importer — API Contracts

## AppNest contract rules

- Every invokable backend function must be **exported** from `app-backend/server.js`.
- Every such function must be declared in `manifest.json`: **API** → `backend_api_functions` with correct function name and timeout.
- Handlers receive **`{ payload }`**. Return a plain object or `ResultData({ body, statusCode })`.
- Frontend calls backend via **`window.appnestClient.backend.invoke({ functionName, payload })`**.

---

## Backend API functions (backend_api_functions)

| Function name     | Purpose                                      | Payload (input)                                                                 | Return / response                                                                 | Timeout (s) |
|-------------------|----------------------------------------------|----------------------------------------------------------------------------------|------------------------------------------------------------------------------------|-------------|
| getSurveys        | Fetch list of surveys from SurveySparrow API | `{}` (API key from installation context)                                        | `{ surveys: [{ id, name, status, ... }] }` or error object                         | 15          |
| getSurveyDetails  | Fetch survey + questions for mapping         | `{ surveyId: string }`                                                           | `{ survey: { id, name, questions: [{ id, type, ... }] } }` or error                | 15          |
| submitResponses   | Submit responses and save run + CSV          | `{ surveyId, surveyName?, rows, csvContent (or csvBase64), csvFileName?, timezone?, submissionCreatedTime? }` | `{ runId, success, failed, errors?, runAt }`; backend creates runId, writes CSV via $file, writes/updates $db run record | 60          |
| listImportRuns    | List import run history                      | `{ limit?, offset?, surveyId? }`                                                 | `{ runs: [{ runId, runAt, surveyId, surveyName, totalRows, successCount, failedCount, status }], total? }` | 15          |
| getImportRun      | Get one run detail + CSV download URL         | `{ runId: string }`                                                              | `{ run: { runId, runAt, surveyId, surveyName, totalRows, successCount, failedCount, errorDetails, timezone, submissionCreatedTime, csvFileName }, csvDownloadUrl }`; csvDownloadUrl from $file.getDownloadUrl | 15          |
| saveSettings      | Save global timezone / submission time (optional) | `{ timezone?, defaultSubmissionCreatedTime? }`                                 | `{ ok: true }`; writes to $db key `settings_{{workspaceId}}`                        | 5           |
| getSettings       | Get global timezone / submission time        | `{}`                                                                             | `{ timezone?, defaultSubmissionCreatedTime? }`                                     | 5           |

- All are **exported** from `app-backend/server.js`.
- submitResponses: backend uses **$http** for SurveySparrow; **$file** to store CSV at `imports/{{workspaceId}}/{{runId}}/upload.csv`; **$db** to create/update import_run and import_run_list.
- listImportRuns / getImportRun: **$db** read; getImportRun also **$file.getDownloadUrl** for CSV.

**manifest.json snippet (backend_api_functions):**

```json
"backend_api_functions": {
  "getSurveys": { "timeout": 15 },
  "getSurveyDetails": { "timeout": 15 },
  "submitResponses": { "timeout": 60 },
  "listImportRuns": { "timeout": 15 },
  "getImportRun": { "timeout": 15 },
  "saveSettings": { "timeout": 5 },
  "getSettings": { "timeout": 5 }
}
```

---

## Event listeners (event_listener_functions)

None. No platform events (e.g. onSubmissionComplete) for this app.

---

## Installation params (installation_params)

| Param key             | display_name          | type    | required | secure | Description                                                                 |
|-----------------------|----------------------|---------|----------|--------|-----------------------------------------------------------------------------|
| surveysparrow_api_key | SurveySparrow API Key | api_key | true     | true   | API key from SurveySparrow (Settings → Apps & Integrations). Used for all SurveySparrow API calls. |

---

## OAuth config (if applicable)

Not used.

---

## Whitelisted domains

```
https://api\.surveysparrow\.com(/.*)?
```

(List all external hosts the app calls; this app only calls SurveySparrow API.)

---

## Scheduled jobs ($schedule)

Not used.

---

## Function chaining ($next)

Not used.
