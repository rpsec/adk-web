# Project Brief: Agent Development Kit Web UI (adk-web)

## Project Overview
This repository contains the **Agent Development Kit (ADK) Web UI**: an Angular-based developer UI that integrates with the **Google Agent Development Kit** backend (typically run via `adk api_server`) to help developers build and debug agents.

The UI is intended for local development and debugging workflows: inspecting sessions, events, traces, artifacts, evaluations, and interacting with agents via chat.

## Core Goals
1. **Developer UX for agent debugging**: make agent runs observable (events, traces, artifacts).
2. **Convenient agent interaction**: chat / streaming chat UI for rapid iteration.
3. **Support agent-building workflows**: agent builder and related tooling inside the UI.

## Key Capabilities (High Level)
- Session-oriented UI for creating/inspecting agent runs
- Events and tracing visualization
- Artifact browsing / viewing
- Evaluations UI
- Agent builder & assistant

## Technical Constraints
- **Frontend**: Angular 19 + TypeScript (ES2022 target)
- **Backend dependency**: requires a running ADK API server reachable via a configured `backendUrl`
- **Runtime configuration**: `src/assets/config/runtime-config.json` is read at startup and injected via npm scripts (see `set-backend.js` and `clean-backend.js`).

## Primary Workflows
### Local development
1. Install dependencies: `npm install`
2. Start the UI with an API server URL injected: `npm run serve --backend=http://localhost:8000`
3. Start the ADK backend separately (example): `adk api_server --allow_origins=http://localhost:4200 --host=0.0.0.0`

## Non-Goals
- This repo does not ship the ADK backend implementation.
- This repo is not a general-purpose agent hosting service; it is a developer UI.
