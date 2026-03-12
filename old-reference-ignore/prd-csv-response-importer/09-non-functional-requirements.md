# CSV Response Importer — Non-Functional Requirements

## Performance

| Requirement         | Target                    | Notes                                                                 |
|---------------------|---------------------------|-----------------------------------------------------------------------|
| Event handler latency | N/A (no event handlers) | —                                                                     |
| API response time   | getSurveys/getSurveyDetails &lt; 15s; submitResponses &lt; 60s | Align with manifest timeouts.                                      |
| Volume              | Up to 10,000 responses per import | Single import run; use batch submission if SurveySparrow API supports it. |

## Reliability and error handling

- **Stateless handlers:** All handlers MUST be stateless. No persistent state in app for v1; SurveySparrow holds data. See `appnest-tools/appnest-governance/01-architecture/01-Architecture-Principles.md`.
- **Retries:** Retry failed SurveySparrow API calls (max 3 retries); backoff on 429. See External API standards below.
- **Partial failure:** For submitResponses, record which rows succeeded and which failed; return success count, failed count, and errors array (row index + message). Do not re-submit duplicates on retry (submit row-by-row or in batches; track failures).
- **ResultData:** Use `ResultData` or plain object for 4xx/5xx; do not throw raw errors. See `appnest-tools/appnest-governance/02-sdk/04-AppNest-SDK-Usage-Rules.md`.

## External API standards

(Ref: `appnest-tools/appnest-governance/03-integration-standards/07-External-API-Standards.md`)

- **Idempotency:** SurveySparrow submission API behaviour (e.g. duplicate submissions) to be followed. If API supports idempotency keys, use them to avoid duplicate responses; otherwise document as best-effort and report failures.
- **Error handling:** Non-200 responses from SurveySparrow must be handled explicitly; return structured error (statusCode, message) to frontend; include failed row indices in submitResponses result.
- **Rate limiting:** On 429, retry with backoff (e.g. exponential); max 3 retries per request.
- **Secrets:** API key only via installation_params; no hardcoding.

## Security

- **Secrets:** API token stored via installation_params (secure); HTTPS for all communication.
- **PII / compliance:** CSV may contain PII. Data is sent to SurveySparrow over HTTPS; a **copy** of the CSV is stored in $file (PRIVATE) for run history and download. Document retention (e.g. how long runs/CSVs are kept) and that only authenticated users with access to the run can get the download URL. No PII in $db beyond optional file name.

## Long-running or chained work

Not used for v1. All work is request-scoped (sync API calls from frontend to backend to SurveySparrow). If future versions need bulk async import, use **$schedule** or **$next** and document in 08-api-contracts.
