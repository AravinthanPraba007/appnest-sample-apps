# {{product_name}} — Non-Functional Requirements

## Performance

| Requirement | Target | Notes |
|-------------|--------|--------|
| **Event handler latency** | {{event_handler_latency}} | Max time for an event handler to complete (align with manifest timeout). |
| **API response time** | {{api_response_time}} | Target for backend_api_functions (set `timeout` in manifest). |
| **Volume** | {{volume_expectation}} | Events or API calls per day / per workspace if relevant. |

## Reliability and error handling

- **Stateless handlers:** All handlers MUST be stateless. Persist state only in $db or external systems. See `appnest-tools/appnest-governance/01-architecture/01-Architecture-Principles.md`.
- **Retries:** {{retry_policy}} (e.g. 429 backoff, idempotent pushes).
- **Partial failure:** {{partial_failure_handling}} (e.g. batch sync: record failures, don’t re-push duplicates).
- **ResultData:** Use `ResultData` for explicit status/body (e.g. 4xx/5xx). Do not throw raw errors without a structured return. See `appnest-tools/appnest-governance/02-sdk/04-AppNest-SDK-Usage-Rules.md`.

## External API standards

(Ref: `appnest-tools/appnest-governance/03-integration-standards/07-External-API-Standards.md`)

- **Idempotency:** External push operations must prevent duplicates. {{idempotency_approach}}
- **Error handling:** Non-200 responses must be handled explicitly. {{error_handling_approach}}
- **Rate limiting:** 429 responses must be retried with backoff. {{rate_limit_approach}}
- **Secrets:** Credentials only via installation_params or oauth_config; no hardcoding.

## Security

- **Secrets:** {{secrets_handling}}
- **PII / compliance:** {{pii_compliance}}

## Long-running or chained work

- Use **$schedule** or **$next** for long-running or multi-step flows. No direct recursion. See SDK usage rules.  
  {{long_running_approach}}
