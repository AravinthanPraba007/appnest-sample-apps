# Survey Response CSV Import — Feature Requirements

## Core features (v1)

| ID | Feature | Description | Priority | Acceptance criteria |
|----|---------|-------------|----------|---------------------|
| F1 | CSV upload & parse | Accept `.csv` upload; detect UTF-8 (and common fallbacks if agreed); parse headers and rows; enforce max file/row limits with clear errors. | Must have | Invalid file type rejected; empty file rejected; preview shows correct column count; row total matches parser. |
| F2 | Tabular preview | Display headers and a limited number of rows in an accessible table before mapping. | Must have | User can verify delimiter and column names; performance acceptable for max row spec. |
| F3 | List surveys | Fetch surveys available to the installed credentials via SurveySparrow public API; show name + id (+ type if useful). | Must have | Surveys match account; API errors shown via **Alert**; loading state via **Spinner**. |
| F4 | Survey selection | Single-select target survey; switching survey clears or warns about incompatible mapping. | Must have | Changing survey resets mapping or prompts confirm; no orphan submissions to wrong survey. |
| F5 | Question / field listing | After survey select, load questions and metadata required for mapping (text, number, choice with options, NPS, etc.—per API). | Must have | Required questions identifiable; choice questions show allowed values or IDs as API provides. |
| F6 | Column mapping UI | For each mappable question, bind one CSV column (or explicit constant/skip if allowed). Intuitive **Select** pairing; show CSV header sample. | Must have | Cannot start import until required mappings satisfied; inline validation messages. |
| F7 | Mapping validation | Server-side validation mirrors client rules; rejects ambiguous payloads before calling SurveySparrow. | Must have | `validateImportConfig` (or equivalent) returns structured errors referencing question id / column. |
| F8 | Import execution | Backend transforms each row to API payload; creates response/submission per SurveySparrow docs; batching + backoff on 429. | Must have | Job record in `$db`; monotonic progress; no double-submit for same logical row within same job (idempotency key strategy documented). |
| F9 | Progress & status | Show queued/running/completed/failed; counts; optional ETA; cancel optional. | Must have | UI never freezes; user sees live counts during long runs. |
| F10 | Error reporting | Row index (or primary key column), error code/message from API or validation; summary totals. | Must have | Success + failed + skipped sums to input rows; exportable or scrollable list. |
| F11 | Security & config | API key (or OAuth if product adopts) only via `installation_params`; no secrets in frontend or $db plaintext beyond platform rules. | Must have | Passes AppNest checklist; `whitelisted_domains` includes `api.surveysparrow.com`. |

## Configuration / settings

- **`surveysparrow_api_key`** (or `product.api_key` bind): required secure installation param for API auth.
- Optional v1: default batch size, max rows per job, encoding override—either fixed in code or advanced settings stored in `$db` per workspace.

(Align `installation_params` with `manifest.json`; remove unrelated placeholder params from sample manifest when implementing.)

## Platform events (if any)

| Event | Needed in v1? |
|-------|----------------|
| `onSubmissionComplete`, `onContactCreate` | **Not required** for core CSV import unless product wants side effects; keep manifest event hooks only if handlers are implemented. |

**v1 recommendation:** No mandatory platform events for import; the app is UI + `backend_api_functions` driven. If events remain in manifest, either implement no-op handlers or remove unused declarations during implementation.

## UI surface

- **Full-page app:** Yes — UI in `app-frontend/src/App.jsx` and child components; **@sparrowengg/twigs-react** and **@sparrowengg/twigs-react-icons** only for controls and layout.
- **Custom installation frontend:** Per product default (`custom_installation_frontend` in manifest—false uses standard install).

## Out of scope (v1)

- Multi-user real-time collaboration on one import job.
- Mapping templates library synced across accounts.
- Automatic AI-based column guessing (optional Phase 2).
