# {{product_name}} — User Flows

## Flow 1: {{flow_1_name}}

**Trigger:** {{flow_1_trigger}}  
**Actor:** {{flow_1_actor}}  
**Screen(s):** {{flow_1_screens}} (optional: from 11-ui-screens; e.g. Dashboard, Settings)  
**Steps:**

1. {{flow_1_step_1}}
2. {{flow_1_step_2}}
3. {{flow_1_step_3}}

**Outcome:** {{flow_1_outcome}}

**AppNest note:** If this flow is triggered by a platform event, the handler name must be exported from `app-backend/server.js` and declared in `manifest.json` under `event_listener_functions`. If triggered by the UI, the frontend calls `window.appnestClient.backend.invoke({ functionName, payload })` where `functionName` is declared in `backend_api_functions`.

---

## Flow 2: {{flow_2_name}}

**Trigger:** {{flow_2_trigger}}  
**Actor:** {{flow_2_actor}}  
**Screen(s):** {{flow_2_screens}}  
**Steps:**

1. {{flow_2_step_1}}
2. {{flow_2_step_2}}

**Outcome:** {{flow_2_outcome}}

---

## Additional flows

{{additional_flows}}
