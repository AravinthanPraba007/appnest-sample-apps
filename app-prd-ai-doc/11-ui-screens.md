# Core Capability Lab — UI Screens

Use this document for the **full-page UI**. Implementation **MUST** use **only** `@sparrowengg/twigs-react` and `@sparrowengg/twigs-react-icons` for controls and layout (**Stack**, **Box**, **Button**, **Text**, **Input**, **Alert**, **Spinner**, **Table**, etc.). **No raw HTML** for buttons, inputs, or tables. Responsive **Stack** / **Box** layout for desktop, tablet, and mobile.

---

## Screens overview

| Screen ID | Screen name | Purpose (one line) | Entry (how user reaches it) |
|-----------|-------------|----------------------|-----------------------------|
| S1 | Capability Lab Home | Run module tests via tabs and view execution log | Open full-page app (default) |
| S2 | Confirm clear data | Confirm before deleting all lab `$db` / `$file` data | User clicks **Clear all lab data** on S1 |

---

## Screen 1: Capability Lab Home

| Field | Description |
|-------|-------------|
| **Purpose** | Central place to trigger **File**, **Storage**, **Network**, **Schedule**, and **Chain** demos and see **recent runs**. |
| **How user reaches it** | Default route when the AppNest full-page app loads. |
| **Layout / sections** | **Stack** (vertical, gap): header **Box** with **Text** (title + short subtitle); **Box** with horizontal **Stack** of **Button** components acting as **tab triggers** (selected state styled per Twigs); **Box** **tab panel** area (one **Stack** per module); **Box** **Execution log** with **Text** heading + **Table** or **Stack** of **Text** rows; footer **Box** with **Button** “Clear all lab data” (opens S2 confirm pattern). |
| **Main UI elements (Twigs only)** | **Stack**, **Box**, **Text**, **Button**, **Input** (for `delaySeconds` on Schedule tab), **Alert** (success/error per module), **Spinner** (loading during `invoke`), **Table** / **Text** (log rows). **Icons:** twigs-react-icons alongside headings/actions where appropriate. Tab switching: **Button** group (not raw `<button>`). |
| **User actions** | **Refresh state** → `getCapabilityLabState`, `{}`. **File tab — Run file test** → `runFileModuleTest`, `{ action: "write" \| "verify" \| "delete" }` per control. **Storage tab — Run storage test** → `runStorageModuleTest`, `{ action: "write" \| "read" }`. **Network tab — Run network test** → `runNetworkModuleTest`, `{ path?: string }`. **Schedule tab — Schedule job** → `scheduleModuleTest`, `{ delaySeconds }` from **Input**. **Chain tab — Run chain demo** → `runChainModuleTest`, `{}`. **Clear all lab data** → navigate to S2 confirm flow (no API until confirm). |
| **Data shown** | Latest module result in **Alert**/**Text**; log from `getCapabilityLabState` → `runs` (columns: time, module, status, message). |
| **Empty / loading / error** | **Empty log:** **Text** (“No runs yet”). **Loading:** **Spinner** + disabled **Button**s. **Error:** **Alert** variant error with message from `invoke` rejection or `{ ok: false }` body. |

---

## Screen 2: Confirm clear data

| Field | Description |
|-------|-------------|
| **Purpose** | Prevent accidental wipe of lab data; require explicit confirmation. |
| **How user reaches it** | From S1: user clicks **Clear all lab data** → UI enters confirm mode (same route: overlay **Box** or inline **Alert** + actions—still Twigs only). |
| **Layout / sections** | **Stack** inside a prominent **Box**: **Text** (warning copy); **Stack** horizontal: **Button** “Cancel”, **Button** “Yes, clear everything” (destructive styling via Twigs button variant if available). |
| **Main UI elements (Twigs only)** | **Stack**, **Box**, **Text**, **Button**, **Alert** (warning). |
| **User actions** | **Cancel** → close confirm UI, no API. **Confirm** → `clearCapabilityLabData`, `{}`; then `getCapabilityLabState`, `{}`; close confirm UI; show **Alert** success. |
| **Data shown** | Static warning **Text**; optional **Text** showing run count from last fetch (if already loaded). |
| **Empty / loading / error** | **Loading:** **Spinner** on confirm **Button** during clear. **Error:** **Alert** if clear fails. |

---

## Additional screens

**None for v1.** Future: optional settings screen if `installation_params` are added.
