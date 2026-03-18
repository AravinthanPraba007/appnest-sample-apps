# External API Standards

## 1. Idempotency

External push operations must prevent duplicates.

## 2. Error Handling

Non-200 responses must be handled explicitly.

## 3. Rate Limiting

429 responses must be retried with backoff.

## 4. Retry Safety

Retries must not cause duplicate resource creation.

## 5. Secrets

Credentials must use **installation_params** (e.g. product_api_key, secure text) or **oauth_config**. Hardcoding secrets is prohibited.