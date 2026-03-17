# SurveySparrow Response Viewer — Non-Functional Requirements

## Performance

| Requirement | Target | Notes |
|-------------|--------|--------|
| **API response time** | Load within ~2 seconds where possible | Backend getSurveys and getSurveyResponses; set timeout 10s in manifest to allow for API latency. |
| **Volume** | Support surveys with 1000+ responses | Pagination (10 per page) keeps response payloads small; no single bulk load of all responses. |

(No event handlers; N/A for event handler latency.)

## Reliability and error handling

- **Stateless handlers:** getSurveys and getSurveyResponses are stateless; no in-memory state across invocations. No $db for v1.
- **Retries:** On SurveySparrow 429 (rate limit), backend should retry with backoff (e.g. exponential) and return ResultData on final failure. No duplicate resource creation (read-only API).
- **Partial failure:** N/A (no batch push). On API timeout or 5xx, return ResultData with appropriate statusCode and message; frontend shows retry option or error message.
- **ResultData:** Use `ResultData` for 4xx/5xx (e.g. unauthorized, timeout, no responses). Do not throw raw errors without a structured return.

## External API standards

(Ref: `appnest-tools/appnest-governance/03-integration-standards/07-External-API-Standards.md`)

- **Idempotency:** Read-only operations; no push. N/A for idempotency of writes.
- **Error handling:** Non-200 responses from SurveySparrow must be handled explicitly; return structured error to frontend (e.g. “Unauthorized”, “API timeout”, “No responses found”).
- **Rate limiting:** 429 responses must be retried with backoff; after retries exhausted, return error to frontend.
- **Secrets:** API key only via installation_params; no hardcoding.

## Security

- **Secrets:** SurveySparrow API key only in installation_params (secure). Never sent to frontend; all API calls from backend using $http.
- **PII / compliance:** Response data may contain respondent info; displayed only in UI, not stored in AppNest. No additional PII handling required for v1 beyond not persisting.

## Long-running or chained work

- Not used for v1. No $schedule or $next. All work is request/response within a single handler.
