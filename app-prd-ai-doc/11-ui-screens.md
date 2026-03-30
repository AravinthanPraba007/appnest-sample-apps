# Survey Response CSV Import — UI Screens

**UI implementation rule:** Implement with **only** `@sparrowengg/twigs-react` and `@sparrowengg/twigs-react-icons`. Layout with **Stack** and **Box**. No raw HTML for **Button**, **Input**, **Select**, **Table**, etc. Responsive, professional SaaS density. Reference: `appnest-ai-context/appnest-governance/App-Frontend-Rules.md`, `Twigs-UI-Reference.md`.

---

## Screens overview

| Screen ID | Screen name | Purpose (one line) | Entry (how user reaches it) |
|-----------|-------------|--------------------|-----------------------------|
| S1 | Import wizard — Upload | Upload CSV and show preview | App open / “Start new import” |
| S2 | Import wizard — Survey | Pick target survey | Next from S1 |
| S3 | Import wizard — Mapping | Map columns to questions | Next from S2 |
| S4 | Import wizard — Run & monitor | Start job, show progress and results | Next from S3 (valid mapping) |

*Implementation may use one **Stepper** or **Tabs** on a single route instead of separate routes—still document as logical screens.*

---

## Screen 1: Import wizard — Upload

| Field | Description |
|-------|-------------|
| **Purpose** | Let user upload CSV and verify structure before survey selection. |
| **How user reaches it** | Default landing when opening the app. |
| **Layout / sections** | **Stack** vertical: **Text** (title + short help), **Box** (drop zone / file trigger), **Alert** (errors), **Table** (preview), **Stack** horizontal (primary **Button** “Continue”). |
| **Main UI elements (Twigs only)** | **Text**, **Box**, **Stack**, **Button**, **Alert**, **Spinner** (parsing), **Table** (preview), **icons** from twigs-react-icons (upload, check). Optional **Link** (Twigs) for format help. |
| **User actions** | Upload file → `ingestCsv`; Continue → navigate to S2 with `ingestId` in state. |
| **Data shown** | Headers, first N rows, total row count from `ingestCsv` response. |
| **Empty / loading / error** | Empty: prompt to upload. Loading: **Spinner** + **Text**. Error: **Alert** variant danger with message from backend. |

---

## Screen 2: Import wizard — Survey

| Field | Description |
|-------|-------------|
| **Purpose** | Select exactly one survey to receive imported responses. |
| **How user reaches it** | Completed S1 with valid ingest. |
| **Layout / sections** | **Stack**: **Text**, **Select** (survey), optional **Input** for search v2, **Alert**, **Stack** row: **Button** Back, **Button** Continue (disabled until survey selected). |
| **Main UI elements (Twigs only)** | **Select**, **Button**, **Text**, **Spinner**, **Alert**, **Stack**, **Box**. |
| **User actions** | Load surveys on mount → `listSurveys`. On Continue → `getSurveyQuestions` then go to S3. |
| **Data shown** | Survey list options (label + value id). |
| **Empty / loading / error** | Loading: **Spinner**. Empty list: **Text** + **Alert**. API error: **Alert**. |

---

## Screen 3: Import wizard — Mapping

| Field | Description |
|-------|-------------|
| **Purpose** | Map each survey question / field to a CSV column; show validation. |
| **How user reaches it** | S2 completed; questions loaded. |
| **Layout / sections** | **Stack**: **Text** summary, **Table** or repeated rows of **Select** (CSV column per question), **Alert** inline validation, **Button** “Validate” optional or validate on Continue, **Stack** row: Back / Continue. |
| **Main UI elements (Twigs only)** | **Table** OR **Stack** of **Box** rows each with **Text** (question) + **Select** (column) + **Text** (hint), **Alert**, **Button**, **Badge** (if Twigs) for required. |
| **User actions** | On Continue → `validateMapping` with `{ ingestId, surveyId, mapping }`; if valid, go to S4 with mapping snapshot. |
| **Data shown** | Question labels, types, required indicator; CSV headers as select options. |
| **Empty / loading / error** | Loading questions: **Spinner**. Validation errors: **Alert** + per-field messages via **Text** or **Alert**. |

---

## Screen 4: Import wizard — Run & monitor

| Field | Description |
|-------|-------------|
| **Purpose** | Start import, show progress, show summary and failures. |
| **How user reaches it** | Valid mapping from S3. |
| **Layout / sections** | **Stack**: **Text** title, **Button** “Start import”, **Progress** or **Text** counts + **Spinner** while running, **Table** for failures, **Button** “Download errors” (optional if file generated), **Button** “New import”. |
| **Main UI elements (Twigs only)** | **Button**, **Progress** (if available in Twigs) or determinate **Text** + bar component from Twigs catalog, **Spinner**, **Table**, **Alert**, **Stack**, **Box**, **Text**. |
| **User actions** | Start → `startImportJob` then poll `getImportJobStatus` (with backoff). Cancel → `cancelImportJob` if implemented. |
| **Data shown** | `status`, succeeded/failed/skipped counts, failure rows with reasons. |
| **Empty / loading / error** | Before start: instructions. Running: **Spinner** + counts. Terminal failure: **Alert**. Completed: success **Alert** + failure **Table**. |

---

## Additional screens

**Settings / About (optional v1):** **Text** showing max rows, supported encoding, link to SurveySparrow API key docs—use **Stack**, **Text**, **Link** (Twigs).
