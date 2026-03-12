# CSV Response Importer — Non-Functional Requirements

## Performance

| Requirement | Target | Notes |
|-------------|--------|--------|
| **Event handler latency** | N/A | No event handlers in v1. |
| **API response time** | getSurveys / getSurveyQuestions / getImportStatus / getImportHistory: &lt; 5 s p95; startImport returns within 20 s after kicking off first chunk. | Timeouts in manifest: 10–15 s for read APIs; 20 s for startImport; 120 s for processImportChunk. |
| **Volume** | CSV up to configurable max (e.g. 50k rows); chunk size (e.g. 100–500 rows) to stay within processImportChunk timeout and rate limits. | Large files handled via $next chunking; no single request processes full file. |

## Reliability and error handling

- **Stateless handlers:** All handlers stateless; state in $db (import_run, column_mapping, import_run_list). See `appnest-tools/appnest-governance/01-architecture/01-Architecture-Principles.md`.
- **Retries:** SurveySparrow API: on 5xx or 429, retry with backoff (e.g. exponential); idempotent where possible (e.g. duplicate rule "skip" avoids re-submitting same row). Partial row failures: log to errorLog and error CSV; continue with remaining rows; user can retry failed via retryFailedImports.
- **Partial failure:** Per-row failures do not abort run; run status "completed" with successCount + failureCount; error log and error rows file available for download.
- **ResultData:** Use `ResultData` for 4xx/5xx (e.g. invalid mapping, API error); do not throw raw errors without structured return. See `appnest-tools/appnest-governance/02-sdk/04-AppNest-SDK-Usage-Rules.md`.

## External API standards

(Ref: `appnest-tools/appnest-governance/03-integration-standards/07-External-API-Standards.md`)

- **Idempotency:** Duplicate handling (allow / skip / update) is configurable per import; "skip" and "update" prevent duplicate submissions as defined by SurveySparrow (e.g. by respondent id or submission id if API supports). Push operations use config to avoid duplicate resource creation where applicable.
- **Error handling:** Non-200 from SurveySparrow handled explicitly; errors stored in run errorLog and optionally in error rows file; return ResultData with appropriate statusCode to frontend.
- **Rate limiting:** 429 responses retried with backoff (e.g. 1s, 2s, 4s); after max retries, row marked failed and processing continues; optionally re-queue chunk with $next and delay.
- **Secrets:** Token only via installation_params; no hardcoding.

## Security

- **Secrets:** API token only in installation_params (secure); never in $db or logs.
- **PII / compliance:** CSV and error files stored in $file with PRIVATE visibility; retention policy (e.g. 30–90 days) for uploaded CSV and error files; document in app or admin docs; optional cleanup job (Phase 2) to delete files past retention.

## Long-running or chained work

- **$next** used for import: startImport invokes processImportChunk; processImportChunk invokes next chunk via $next.run until done, then updates run status. No direct recursion. Timeout for processImportChunk set to 120 s to allow one chunk of submissions plus retries. See SDK usage rules.
