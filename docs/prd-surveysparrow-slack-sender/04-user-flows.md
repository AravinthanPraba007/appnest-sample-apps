# SurveySparrow → Slack Response Sender — User Flows

## Flow 1: Send latest responses to Slack

**Trigger:** User opens the Appnest app and wants to post recent answers to Slack.  
**Actor:** Primary persona.  
**Screen(s):** Main sender (see **11-ui-screens.md** — Screen S1).  
**Steps:**

1. App loads; backend fetches survey list from SurveySparrow; UI shows **Select** with survey names (or error **Alert** if load fails).
2. User selects a survey, pastes **Slack Webhook URL** in **Input**, clicks **Send Latest Responses**.
3. Backend fetches latest 5 responses for that survey, formats text, POSTs to Slack webhook; UI shows success **Alert** or error (no responses, webhook invalid, rate limit).

**Outcome:** Slack channel receives one message titled e.g. **New Survey Responses** with formatted Q&A per respondent.

**AppNest note:** The UI calls `window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })` for `listSurveys` and `sendLatestResponsesToSlack` as declared in `manifest.json` → `backend_api_functions`.

---

## Flow 2: Recover from load or send errors

**Trigger:** Survey list failed to load, or send failed (network, 429, invalid webhook).  
**Actor:** Primary persona.  
**Screen(s):** Main sender (S1).  
**Steps:**

1. User reads **Alert** with a specific message (API failure, retry for rate limit, invalid webhook, no responses).
2. User corrects input (webhook) or retries after backoff message; may refresh page to retry survey load.

**Outcome:** User understands failure mode and can retry without exposing secrets.

---

## Additional flows

*No additional flows for v1.*
