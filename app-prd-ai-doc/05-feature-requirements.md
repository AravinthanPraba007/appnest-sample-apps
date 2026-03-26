# Core Capability Lab — Feature Requirements

## Core features (v1)

| ID | Feature | Description | Priority | Acceptance criteria |
|----|---------|-------------|----------|---------------------|
| F1 | Tabbed module layout | Five tabs: File, Storage, Network, Schedule, Chain | Must have | User can switch tabs; only one tab’s primary panel is active; layout uses Twigs **Stack** / **Box** |
| F2 | File operations module | Demonstrate `$file` (e.g. write/upload demo artifact, list or verify path, optional delete) | Must have | `runFileModuleTest` returns structured result; run appended to log |
| F3 | Storage module | Demonstrate `$db` string/map/list read/write for demo keys | Must have | `runStorageModuleTest` read/write succeeds; visible in response and log |
| F4 | Network module | Demonstrate `$fetch` GET to a path on a **whitelisted** host only | Must have | `runNetworkModuleTest` returns status/body summary; non-whitelisted hosts never called |
| F5 | Schedule module | Create a **ONE_TIME** job via `$schedule` calling `executeScheduledCapabilityJob` | Must have | Job appears created; after `runAt`, handler runs and appends log entry |
| F6 | Chain module | Demonstrate `$next` from `chainCapabilityStepOne` → `chainCapabilityStepTwo` | Must have | Two log entries (or one consolidated with sub-steps) prove ordering |
| F7 | Execution log | Persist each run in `$db` (list or append pattern) | Must have | `getCapabilityLabState` returns recent runs; survives reload |
| F8 | Clear all | Remove lab `$db` keys and lab `$file` paths | Must have | After `clearCapabilityLabData`, `getCapabilityLabState` shows empty log |

## Configuration / settings

| Item | Purpose | Manifest mapping |
|------|---------|------------------|
| Network demo base URL | Fixed to whitelisted SurveySparrow API host for v1 | Covered by `whitelisted_domains`; optional future `installation_params` for **path-only** override (same host) |

No secrets required for v1. If a future phase adds optional API key for an external echo service, add `installation_params` and extend `whitelisted_domains`.

## Platform events (if any)

**None in v1.** The app does not subscribe to `onSubmissionComplete`, `onContactCreate`, or other platform events. `event_listener_functions` in `manifest.json` is `{}` or omitted per schema allowance.

## UI surface

- **Full-page app:** **Yes** — `app-frontend/src/App.jsx` and child components; **`@sparrowengg/twigs-react`** and **`@sparrowengg/twigs-react-icons`** only for UI controls and layout (**Stack**, **Box**, **Button**, **Text**, **Input**, **Alert**, **Spinner**, **Table** as needed).
- **Custom installation frontend:** **No** — `custom_installation_frontend: false`.

## Out of scope (v1)

- OAuth login demos, webhooks, batch imports, multi-user audit trails, exporting logs to CSV, email notifications.
