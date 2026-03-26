# Appnest Development Engine

Development CLI and runtime for Appnest apps. It wires your **app-backend**, **app-frontend**, and optional **app-install-frontend** behind a single proxy, runs checks, and helps you bundle and zip the app for distribution.

**Package:** `@sparrowengg/appnest-development-engine` · **CLI binary:** `appnest-development-engine`

## Related docs

- **[Appnest-Development-Engine-Commands.md](./Appnest-Development-Engine-Commands.md)** — Command reference (`app init`, `start`, `validate`, `pack`, …).
- **[App-Developement.md](./App-Developement.md)** — What app developers build in their project (folders, rules).

---

## Overview

Appnest Engine runs from the **developer's project directory** (where `app-backend`, `app-frontend`, etc. live). It provides:

- **CLI** — Commands for init, precheck, install, start, validate, bundle, and pack.
- **Proxy** — One server on port **3456** (default) that routes traffic to your app's backend and frontends.
- **Engine packages** — Shared runtime (proxy, backend layer, Vite dev servers) that load your app code from the current directory via **`ORIGINAL_CWD`**.
