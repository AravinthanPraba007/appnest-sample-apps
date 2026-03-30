# SurveySparrow Contact CSV Export — Non-Functional Requirements

## Performance

| Requirement | Target | Notes |
|-------------|--------|-------|
| **Event handler latency** | N/A | No event handlers in v1 |
| **API response time** | `listSurveySparrowContacts` completes within manifest **20s** timeout under normal conditions | Align with SurveySparrow latency; show **Spinner** in UI while waiting |
| **Volume** | Typical workspaces up to tens of thousands of contacts; UI uses pagination (`maxResults` ≤ 100) | Avoid loading full contact list in one request |

## Reliability and error handling

- **Stateless handlers:** `listSurveySparrowContacts` must not rely on in-memory state across invocations.
- **Retries:** On **429** or transient **5xx** from SurveySparrow, backend retries **up to 2** additional attempts with exponential backoff (e.g. 500ms, 1500ms) before failing. Do not retry on **4xx** except 429.
- **Partial failure:** Single-request scope; if the list call fails, return structured error to UI; no partial CSV from server in v1.
- **ResultData:** Use `ResultData` for explicit status/body when surfacing SurveySparrow errors to the client.

## External API standards

(Ref: `appnest-ai-context/appnest-governance/Code-Review-and-AI-Generation-Checklist.md` — External API section)

- **Idempotency:** v1 performs **read-only GET** only; no duplicate resource creation risk.
- **Error handling:** Map non-200 responses to user-visible **Alert** messages (no raw stack traces); include `traceId` in logs only.
- **Rate limiting:** Apply **429** backoff as above; surface a clear “too many requests, try again” message if still failing.
- **Secrets:** Credentials only via installation_params; no hardcoding.

## Security

- **Secrets:** SurveySparrow token from `installation_params` only; never returned to client.
- **PII / compliance:** Treat downloaded CSV as sensitive; no server-side retention in v1.

## Long-running or chained work

_Not required._ Listing fits within a single handler invocation; no `$schedule` or `$next` for v1.
