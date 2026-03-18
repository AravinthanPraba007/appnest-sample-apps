# SurveySparrow → Slack Response Sender — Non-Functional Requirements

## Performance

| Requirement | Target | Notes |
|-------------|--------|--------|
| **Event handler latency** | N/A | No event handlers in v1. |
| **API response time** | `listSurveys` ≤30s; `sendLatestResponsesToSlack` ≤60s | Manifest timeouts; SurveySparrow + Slack round trips. |
| **Volume** | Low | Manual, on-demand sends; no batch scheduling. |

## Reliability and error handling

- **Stateless handlers:** No cross-invocation state; no $db dependency.
- **Retries:** On SurveySparrow **429**, retry with exponential backoff (e.g. 1–3 attempts) before returning user-facing “rate limited, retry later”. Slack webhook failures: surface Slack error body if safe; no retry loop on 4xx from Slack (invalid webhook).
- **Partial failure:** If responses API returns empty array → UI: **“No responses found”**.
- **ResultData:** Use for survey API failure, validation (missing survey/webhook), Slack non-2xx.

## External API standards

- **Idempotency:** Slack posts are **not** idempotent—each click sends a new message. Acceptable for v1; mitigate duplicate spam by disabling **Button** while request in flight.
- **Error handling:** Map non-200 SurveySparrow responses to structured errors; never expose raw token in errors.
- **Rate limiting:** 429 on SurveySparrow → backoff + user message per PRD.
- **Secrets:** Token in installation_params only; **do not log** `slackWebhookUrl`.

## Security

- **Secrets:** Install token server-only; webhook in memory for request duration only.
- **PII / compliance:** Response text forwarded to Slack only; user controls destination channel via webhook.

## Long-running or chained work

Single synchronous flow per invoke; no **$schedule** / **$next** for v1.
