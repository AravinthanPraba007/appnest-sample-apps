# Survey Response CSV Import — User Flows

## Flow 1: Install and open app

**Trigger:** User installs the AppNest app from the SurveySparrow marketplace or admin UI and opens the full-page app.  
**Actor:** Survey administrator  
**Screen(s):** Main layout — **Import home** (upload step)  
**Steps:**

1. Admin completes installation params (e.g. SurveySparrow API key per manifest).
2. Admin opens the app; UI confirms connectivity (optional lightweight “connection check” or first API list call).

**Outcome:** User lands on the CSV upload step with clear short instructions.

**AppNest note:** Installation params are defined in `manifest.json` → `installation_params`. If a connectivity check is needed, the frontend calls `window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })` for a small backend function that uses `$fetch` against SurveySparrow.

---

## Flow 2: Upload CSV and preview

**Trigger:** User selects or drops a `.csv` file.  
**Actor:** Survey administrator  
**Screen(s):** Import home — **CSV preview** panel  
**Steps:**

1. Frontend requests upload path or sends file per platform pattern; backend stores or parses CSV (see 07-data-model / `$file` decision).
2. Backend parses CSV (encoding, delimiter detection if specified in PRD implementation), validates size/row limits, returns headers and a bounded preview (e.g. first N rows).
3. UI shows **Table** (Twigs) of preview; user can proceed if data looks correct.

**Outcome:** Parsed structure (headers + row count + preview) is available for mapping.

---

## Flow 3: Select survey and load questions

**Trigger:** User proceeds from preview to survey selection.  
**Actor:** Survey administrator  
**Screen(s):** **Survey picker**; **Mapping** (question list loads after selection)  
**Steps:**

1. Frontend invokes backend to **list surveys** (filtered to surveys the credential can access).
2. User selects exactly one target survey from **Select** (search optional v1+).
3. Backend fetches **survey definition / questions** needed to build answer mappings (per SurveySparrow public API capabilities).

**Outcome:** UI displays survey questions (and any required metadata such as choice IDs) for mapping.

---

## Flow 4: Map CSV columns to survey fields

**Trigger:** Questions are loaded; user maps each required answer source.  
**Actor:** Survey administrator  
**Screen(s):** **Column mapping**  
**Steps:**

1. For each survey question (or mappable field), user chooses a CSV column from **Select**, or chooses “ignore / default / constant” where product rules allow.
2. UI shows validation state: missing required mappings, incompatible types (e.g., text vs numeric scale), invalid option values for choice questions when detectable client-side from metadata.
3. User can save **draft mapping** to `$db` (optional v1) or keep mapping only in session until import starts.

**Outcome:** A complete, validated mapping object is ready for the backend import job.

---

## Flow 5: Start import and track progress

**Trigger:** User confirms mapping and clicks **Start import**.  
**Actor:** Survey administrator  
**Screen(s):** **Import progress** (can be same page with **Stepper** or tabs)  
**Steps:**

1. Frontend calls backend **startImport** with references to stored CSV job + mapping + survey ID.
2. Backend creates an **import job** record, processes rows in batches, calls SurveySparrow create-submission/response endpoints via `$fetch`, updates progress counters atomically in `$db`.
3. UI polls **getImportStatus** or receives chunked updates (implementation choice) and shows **Progress** / **Spinner**, counts (succeeded, failed, skipped), and recent errors.
4. On completion, UI shows summary and **row-level error list** (pagination for large failures).

**Outcome:** Responses exist in SurveySparrow for all successful rows; user knows exactly what failed and why.

---

## Additional flows

**Flow 6: Handle failure and partial retry (v1 baseline)**  
User downloads or copies failed-row identifiers; fixes CSV or mapping; starts a **new** import for corrected subset, or re-uploads file. Full “retry failed only” can be a fast-follow if job artifact supports row keys.

**Flow 7: Cancel import (optional v1)**  
User cancels in-flight job; backend sets job status to cancelled and stops scheduling further batch work (`$next` batches honor cancellation flag).
