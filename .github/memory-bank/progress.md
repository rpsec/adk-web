# Progress

## Project Status Overview
This repository is **Agent Development Kit Web UI (adk-web)**: an Angular-based developer UI that connects to an external ADK API server for agent development and debugging.

## What Works (Verified by inspection)
- ✅ **Angular 19 app structure**: standalone bootstrap + modular components under `src/app/components/`.
- ✅ **Runtime config mechanism**: startup fetch of `assets/config/runtime-config.json` and global `window.runtimeConfig`.
- ✅ **Backend URL injection**: `npm run serve --backend=...` writes runtime config via Node scripts.
- ✅ **Core services organization**: services under `src/app/core/services/` with DI tokens in `interfaces/`.

## What's In Progress
- 🔄 **Documentation alignment**: Memory Bank updated to match this repo.
- 🔄 **Backend contract inventory**: identifying required API routes and WebSocket events used by the UI.
- 🔄 **Interactive terminal integration**: terminal tab + command execution client + history sharing.

## What's Left to Build / Verify
- ❓ **End-to-end run validation**: confirm UI + `adk api_server` operate correctly together in this environment.
- ❓ **API contract documentation**: capture endpoints/events used by key surfaces (chat, sessions, events, traces, artifacts, eval).
- ❓ **Test stability**: validate test setup and document/resolve common pitfalls (notably `initTestBed()` ordering).
- ❓ **Test DI updates for new tokens**: update specs to provide `TERMINAL_SERVICE` (and any related tokens) where newly injected.

## Known Issues / Risks
- ⚠️ **Backend required**: the UI is dependent on a reachable ADK API server; missing/misconfigured `backendUrl` blocks most features.
- ⚠️ **CORS alignment**: backend must allow the UI origin during local dev.
- ⚠️ **WebSocket host derivation**: WebSocket URL behavior depends on runtime-config and scheme handling.
- ⚠️ **Unit tests currently failing**: running `npm test` reports many failures due to `NullInjectorError: No provider for InjectionToken TerminalService!` in component specs.

## Session Log
### 2025-12-13
- Discovered Memory Bank content was for an unrelated project and corrected it to document adk-web.
- Confirmed runtime config injection via `set-backend.js` and startup fetch in `src/main.ts`.
- Established an initial, repo-appropriate task list (see tasks index).
- Implemented interactive terminal UI + terminal history service and wired Option A history sharing into outgoing prompts.
- Ran `npm test`; observed widespread `NullInjectorError` failures for `TERMINAL_SERVICE` in `AppComponent`, `ChatComponent`, and `SidePanelComponent` specs.
