# Core Capability Lab — Data Model

## AppNest storage

All cross-invocation state uses **`$db`**. Types: `string`, `number`, `list`, `map`, `boolean`. Run records are **not** held only in memory.

---

## Core entities

| Entity | Purpose | Key pattern (for $db) | $db type | Notes |
|--------|---------|-------------------------|----------|-------|
| Execution log | Ordered history of module runs | `capability_lab:runs` | `list` | Each item: JSON string or map element with `id`, `module`, `at`, `status`, `message`, optional `detail` |
| Storage demo KV | Read/write demo for Storage tab | `capability_lab:storage_demo` | `string` | Value: JSON string `{ lastWriteAt, sampleValue }` or plain string per implementation |
| Schedule metadata (optional) | Last created job id for UI display | `capability_lab:last_schedule_job_id` | `string` | Optional; may be omitted if response returns job id directly |

## Storage keys

- **`capability_lab:runs`** — `list` of run entries (max length enforced in code, e.g. last 100).
- **`capability_lab:storage_demo`** — `string` (JSON-serialized object acceptable).
- **`capability_lab:last_schedule_job_id`** — `string` (optional).

**Key format:** Fixed prefixes `capability_lab:` so `clearCapabilityLabData` can delete by known keys.

**Value shape:** Run entries should be small (no large payloads); store summaries only.

## Sensitive data

- **Secrets:** Not stored in `$db` for v1.
- **PII:** **None** — lab must not collect personal data; messages are diagnostic only.

## File storage ($file)

| Path or pattern | Visibility | Operations used | Handler(s) | Notes |
|-----------------|------------|-------------------|------------|-------|
| `capability-lab/demo.txt` | PUBLIC | getUploadUrl / write (per SDK), exists, list (if applicable), delete | `runFileModuleTest`, `clearCapabilityLabData` | Single canonical demo file for simplicity; optional timestamp suffix `capability-lab/run-{id}.txt` if multiple artifacts needed |

- **Visibility:** PUBLIC so download URL flow can be demonstrated without extra auth complexity (align with product guidelines).
- **Clear:** `clearCapabilityLabData` deletes known lab paths or prefix `capability-lab/` per SDK capabilities.

---

## External system data (if any)

**None persisted for idempotency** in v1. Network module performs **read-only** GET; no external IDs stored unless a future phase adds them.
