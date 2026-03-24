# {{product_name}} — Feature Requirements

## Core features (v1)

| ID | Feature | Description | Priority | Acceptance criteria |
|----|---------|-------------|----------|---------------------|
| F1 | {{feature_1_name}} | {{feature_1_description}} | Must have | {{feature_1_acceptance_criteria}} |
| F2 | {{feature_2_name}} | {{feature_2_description}} | Must have | {{feature_2_acceptance_criteria}} |
| F3 | {{feature_3_name}} | {{feature_3_description}} | Must have | {{feature_3_acceptance_criteria}} |
| {{F4_F5}} | … | … | … | … |

## Configuration / settings

{{configuration_items}}

(These may map to `installation_params` in `manifest.json` and/or to app UI that persists config via backend API and $db.)

## Platform events (if any)

{{platform_events}}

(Each must have a handler exported from `app-backend/server.js` and declared in `manifest.json` → `event_listener_functions`.)

## UI surface

- **Full-page app:** {{has_full_page_app}} (if yes, UI is built in `app-frontend/src/App.jsx` and child components; use `@sparrowengg/twigs-react` and `@sparrowengg/twigs-react-icons` for components and icons.)
- **Custom installation frontend:** {{custom_installation_frontend}} (if true, use `app-installation-frontend`.)

## Out of scope (v1)

{{out_of_scope_features}}
