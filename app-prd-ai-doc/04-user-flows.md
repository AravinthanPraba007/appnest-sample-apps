# Core Capability Lab — User Flows

## Flow 1: Run a module test from a tab

**Trigger:** User clicks a primary action (e.g. “Run test”) on one of the capability tabs.  
**Actor:** Internal engineer / QA.  
**Screen(s):** **S1 — Capability Lab Home** (see `11-ui-screens.md`).  
**Steps:**

1. User opens the full-page app (default view: Capability Lab Home).
2. User selects a **tab** (File, Storage, Network, Schedule, Chain).
3. User triggers the module action (and optional inputs where specified, e.g. delay seconds for schedule).
4. Frontend calls `window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })` for that module.

**Outcome:** UI shows **Spinner** while waiting, then **Alert** or result **Text** with summary; execution log updates (via `getCapabilityLabState` refresh or inline response).

**AppNest note:** Each action maps to a named function in `backend_api_functions` (see `08-api-contracts.md`).

---

## Flow 2: Review execution history

**Trigger:** User lands on the app or switches tabs after runs.  
**Actor:** Internal engineer / QA.  
**Screen(s):** **S1 — Capability Lab Home** (global log section).  
**Steps:**

1. App loads (or user clicks **Refresh state**).
2. Frontend invokes `getCapabilityLabState` with `{}`.
3. UI renders the latest **Table** (or **Text** list) of recent runs from the response.

**Outcome:** User sees **chronological run records** (module, time, status, short message).

---

## Flow 3: Reset lab data

**Trigger:** User clicks **Clear all lab data**.  
**Actor:** Internal engineer / QA.  
**Screen(s):** **S1 — Capability Lab Home**.  
**Steps:**

1. User confirms intent (optional **Alert** / confirm pattern using Twigs **Dialog** if available; otherwise destructive **Button** with clear labeling per UX review).
2. Frontend invokes `clearCapabilityLabData` with `{}`.
3. UI refreshes state via `getCapabilityLabState`.

**Outcome:** All documented `$db` keys and lab `$file` prefixes are cleared; UI shows **empty** log / zero counts.

---

## Additional flows

**Flow 4 — Scheduled job completes asynchronously**

**Trigger:** User runs **Schedule** tab → “Schedule one-shot job” with `delaySeconds`.  
**Actor:** Internal engineer.  
**Screen(s):** S1, Schedule tab.  
**Steps:** `scheduleModuleTest` creates a **ONE_TIME** `$schedule` job targeting `executeScheduledCapabilityJob`; job appends a run record when it fires.  
**Outcome:** After delay, refreshed log shows a **scheduled** module entry (user may refresh manually).

**Flow 5 — Chained execution**

**Trigger:** User runs **Chain** tab → “Run chain demo”.  
**Actor:** Internal engineer.  
**Screen(s):** S1, Chain tab.  
**Steps:** `runChainModuleTest` calls `chainCapabilityStepOne`, which uses `$next.run` to invoke `chainCapabilityStepTwo` with a short delay.  
**Outcome:** Log contains **ordered** records proving both steps ran.
