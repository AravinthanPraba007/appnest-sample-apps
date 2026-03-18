# SurveySparrow Response Viewer — Non-Functional Requirements

## Performance

| Requirement | Target | Notes |
|-------------|--------|--------|
| **API response time** | Load within ~2 seconds | Backend API functions (getSurveys, getResponses, listBackups, etc.) should return within timeout; target UX is &lt; 2s for list and response page load. |
| **Volume** | Support surveys with 1000+ responses | Pagination (10 per page) and backend timeouts (e.g. getResponses 15s) must support large result sets. |

(No event handlers; event_handler_latency N/A.)

## Reliability and error handling

- **Stateless handlers:** All handlers MUST be stateless. Persist state only in $db or $file. See `appnest-tools/appnest-governance/01-architecture/01-Architecture-Principles.md`.
- **Retries:** On SurveySparrow API 429 or 5xx, backend should retry with backoff (e.g. exponential) where applicable; getResponses/getSurveys are idempotent reads.
- **Partial failure:** If syncSurveys partially fails, return clear error or partial success; do not leave cache in inconsistent state (e.g. replace surveys_list only on full success, or document strategy).
- **ResultData:** Use `ResultData` for explicit status/body (e.g. 4xx/5xx). Do not throw raw errors without a structured return. See `appnest-tools/appnest-governance/02-sdk/04-AppNest-SDK-Usage-Rules.md`.

## External API standards

(Ref: `appnest-tools/appnest-governance/03-integration-standards/07-External-API-Standards.md`)

- **Idempotency:** Read-only operations (GET surveys, GET responses); no push. Backup write is append-by-date; avoid duplicate same-day backup by keying on date.
- **Error handling:** Non-200 from SurveySparrow must be handled; return structured error to frontend; do not expose raw API messages if they contain internals.
- **Rate limiting:** 429 from SurveySparrow must be retried with backoff; respect Retry-After if present.
- **Secrets:** API key only via installation_params; no hardcoding.

## Security

- **Secrets:** API keys stored only via installation_params (secure). Backend uses them for $http; never sent to frontend.
- **PII / compliance:** Respondent data from API displayed in UI and stored in backups; minimize retention and exposure per product policy; no API tokens in frontend.

## Long-running or chained work

- **runScheduledBackup** may run up to 60s (timeout). Use $schedule for periodic backup; no $next chaining in v1. See SDK usage rules.
