# Active Context

## Current Focus (2025-12-13)
- Landing the interactive terminal (xterm.js) integration cleanly (UI + history + agent sharing).
- Stabilizing the unit test suite after introducing the new DI token `TERMINAL_SERVICE`.
- Keeping Memory Bank + task tracking accurate as implementation progresses.

## Recent Changes
- Rewrote Memory Bank core docs to match this repo (Angular ADK Web UI) rather than an unrelated monorepo.
- Added an interactive terminal surface (Terminal tab) and terminal-history-to-agent sharing (Option A).
- Ran the full unit test suite and discovered widespread failures due to missing DI providers for the new terminal token.

## Next Steps
1. Fix unit test DI wiring for `TERMINAL_SERVICE` (provide a mock in affected specs and/or via shared test init).
2. Re-run `npm test` to confirm the suite passes and validate `TerminalService` tests.
3. Confirm the backend contract for terminal execution endpoint (`POST /terminal/execute`) since commands run remotely.

## Active Decisions
- **Runtime-config-first boot**: keep runtime environment decisions outside build artifacts by loading `runtime-config.json` before bootstrapping.
- **Token-based DI**: continue to prefer DI tokens for service indirection and testability.

## Current Challenges / Risks
- Backend coupling: the UI is only as useful as the stability/contract of the ADK API server.
- Local dev ergonomics: configuration injection must remain predictable (backend URL, CORS, WebSocket host).
- Test harness gotcha: tests need `initTestBed()` ordering to avoid brittle failures.
- New DI tokens require updating component specs; otherwise tests fail with `NullInjectorError`.

## Open Questions
- Which backend is the primary supported target for this repo at any given time (ADK Python vs ADK Java), and do they share identical API contracts?
- What is the authoritative list of API routes and WebSocket events expected by the UI?
