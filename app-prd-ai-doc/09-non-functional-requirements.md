# Core Capability Lab — Non-Functional Requirements

## Performance

| Requirement | Target | Notes |
|-------------|--------|--------|
| **Event handler latency** | N/A for v1 | No event handlers |
| **API response time** | p95 &lt; 3s for sync modules (File, Storage, Network, Chain kick-off) | Align `timeout` in manifest |
| **Volume** | Low — manual testing only; &lt; 100 scheduled jobs per workspace per day expected | Enforce max `delaySeconds` (e.g. ≤ 600) in handler |

## Reliability and error handling

- **Stateless handlers:** Persist only via `$db` / `$file`; no module-level globals for cross-request state.
- **Retries:** Network demo: **one** GET attempt; on failure return structured `{ ok: false, message }` (optional single retry for 5xx only—document in implementation). **429:** optional one backoff retry for lab friendliness.
- **Partial failure:** If file write succeeds but log append fails, return `ResultData` or body that states partial success (implementation detail).
- **ResultData:** Use for HTTP-like errors from network demo when useful; avoid unhandled throws.

## External API standards

(Ref: `appnest-ai-context/appnest-governance/03-integration-standards/07-External-API-Standards.md`)

- **Idempotency:** v1 **does not create** external resources; GET-only → **N/A** for duplicate creation.
- **Error handling:** Non-2xx: capture status + short body snippet in response and execution log (truncate length).
- **Rate limiting:** On **429**, backoff once (e.g. 1s) then fail with clear message.
- **Secrets:** None in v1 for external calls.

## Security

- **Secrets:** Not used in `$db`; no tokens in execution log.
- **PII / compliance:** Lab is **non-production** diagnostic; must not prompt for or store PII.

## Long-running or chained work

- **Schedule:** Use `$schedule` for delayed `executeScheduledCapabilityJob`.
- **Chain:** Use `$next.run` from step one to step two; **no** unbounded recursion.
