# Survey Response CSV Import — Non-Functional Requirements

## Performance

| Requirement | Target | Notes |
|-------------|--------|--------|
| **Event handler latency** | N/A for v1 core | No mandatory platform events. |
| **API response time** | Interactive endpoints ≤ 3s typical; `processImportBatch` up to manifest timeout | Heavy work in batch, not in `listSurveys`. |
| **Volume** | v1: configurable cap (e.g. 10k–50k rows per job—set in implementation) | Document max rows in UI; enforce before parse or before API loop. |

## Reliability and error handling

- **Stateless handlers:** Persist job state in `$db`; derive next work from `cursor` + job record.
- **Retries:** Exponential backoff on **429** and transient **5xx** responses from SurveySparrow; cap retries per row and mark as failed with reason.
- **Partial failure:** Continue batch after row failure; never fail entire job silently—final status reflects mixed outcomes.
- **ResultData:** Return structured errors (`{ code, message, row?, questionId? }`) for UI and logs.

## External API standards

- **Idempotency:** Before creating a response for `(jobId, rowIndex or row hash)`, check `$db` idempotency key; if exists, skip API call and count as already created.
- **Error handling:** Map SurveySparrow validation errors to user-visible strings; log `getTraceId()` with job id.
- **Rate limiting:** Honor `Retry-After` if present; otherwise exponential backoff.
- **Secrets:** Only installation_params / platform secure storage.

## Security

- **Secrets:** Never log API keys; redact auth headers in debug logs.
- **PII / compliance:** CSV may contain personal data—minimize retention, prefer PRIVATE `$file`, offer delete-after-complete. Advise customers to use least-privilege API keys where SurveySparrow allows.

## Long-running or chained work

- Use **`$next.run`** to chain `processImportBatch` until all rows processed or job cancelled/failed—avoids single-handler wall time limits.
- Optional: if platform supports very large payloads, stream file read—document approach in implementation.

**long_running_approach:** Batch + `$next` chaining; progress persisted each batch so UI polling shows accurate counts after failures or refresh.
