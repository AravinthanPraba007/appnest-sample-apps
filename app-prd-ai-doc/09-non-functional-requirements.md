# SurveySparrow Contact Export — Non-Functional Requirements

## Performance

| Requirement | Target | Notes |
|-------------|--------|--------|
| **Event handler latency** | N/A (no v1 event handlers) | — |
| **API response time** | **`getContacts`** p95 under **15s** for orgs within SurveySparrow normal limits; manifest timeout **20s**. | Large responses should use **max API page size** cap (e.g. 50) to avoid timeouts. |
| **Volume** | Support accounts with **tens of thousands** of contacts via **pagination only** (never pull full set in one call). | UI debounces search to limit QPS. |

## Reliability and error handling

- **Stateless handlers:** No in-memory caches across invocations in v1; each `getContacts` is independent.
- **Retries:** On **429** from SurveySparrow, backend may apply **one** retry with short backoff if within timeout; document behavior in implementation. On **5xx**, return structured error; optional single retry if time allows.
- **Partial failure:** N/A for read-only single-endpoint list; batch export is client-side only.
- **ResultData:** Use **`ResultData`** for explicit HTTP-style errors (401/403/429/500) with user-safe messages.

## External API standards

(Ref: `appnest-ai-context/appnest-governance/Code-Review-and-AI-Generation-Checklist.md` — External API section)

- **Idempotency:** **N/A** — read-only GETs; no resource creation.
- **Error handling:** Map SurveySparrow error JSON (if any) to stable `{ code?, message }` for UI; log **correlation id** via `getTraceId()` without PII.
- **Rate limiting:** Respect **429**; backoff; surface “try again shortly” in **Alert**.
- **Secrets:** Credentials only via **`installation_params`**; inject Bearer in backend only.

## Security

- **Secrets:** Never return token to frontend; only use server-side `$fetch` with platform-provided credentials context.
- **PII / compliance:** CSV download is user-initiated; document that exports may contain PII and follow org policy; avoid persisting exports on server in v1.

## Long-running or chained work

- **Not required for v1.** All work fits in a single `getContacts` invocation. No `$schedule` / `$next` unless post-MVP batch features are added.
