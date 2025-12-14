# TASK005 - Add Interactive Terminal (xterm.js)

**Status:** Completed  
**Added:** 2025-12-13  
**Updated:** 2025-12-14

## Original Request
“Add a terminal to this front-end application using xterm.js. Agents should have access to the last 20 lines of terminal history, or the entire history if the user desires. Terminal should be interactive; commands will run somewhere else.”

## Thought Process
The terminal needs to be a first-class debugging surface in the existing Side Panel tab group, consistent with Trace/Events/State/etc.

Key requirements:
- Embed xterm.js UI
- Maintain terminal history with a default last-20-lines view for agent context
- Allow explicit user opt-in to share full history
- Optional redaction before sharing (and before persistence)
- Optional persistence per session
- Interactive input should execute commands via a backend endpoint (frontend implements client; backend contract may be implemented separately)

## Implementation Plan
- Add `xterm` + `xterm-addon-fit` dependencies and load `xterm.css` globally
- Create `TerminalService` with:
  - ring buffer for last 20 lines
  - capped full transcript
  - toggles: share, share-full, redact, persist
  - localStorage persistence scoped by appName/userId/sessionId
- Add `TerminalCommandService` that POSTs to a backend terminal execute endpoint
- Add `TerminalTabComponent` hosted in the existing side panel `mat-tab-group`
- Implement Option A: prepend terminal history to outgoing chat prompt in `getUserMessageParts()`
- Add unit tests for history/toggles/persistence behavior

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks
| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 5.1 | Add deps + styles | Complete | 2025-12-13 | package.json + angular.json styles |
| 5.2 | Implement TerminalService + CommandService | Complete | 2025-12-13 | Tokens + providers in main.ts |
| 5.3 | Add Terminal tab UI | Complete | 2025-12-14 | Component created, mounted, and verified |
| 5.4 | Inject history into agent prompt | Complete | 2025-12-13 | Option A in chat component |
| 5.5 | Add unit tests | Complete | 2025-12-14 | terminal.service.spec.ts added and passing |
| 5.6 | Fix impacted unit tests (DI) | Complete | 2025-12-14 | Added TERMINAL_SERVICE provider stubs to affected specs |

## Progress Log
### 2025-12-13
- Added xterm dependencies and global CSS inclusion
- Implemented terminal history service (tail 20 + full transcript, redaction, persistence)
- Implemented terminal command execution service (POST /terminal/execute)
- Mounted a new Terminal tab in the side panel and wired prompt-injection (Option A)
- Added initial unit tests for the terminal service

### 2025-12-13
- Ran `npm test`; many failures were reported due to missing providers for `TERMINAL_SERVICE` in component specs.
- Next step: update affected specs (e.g., `AppComponent`, `ChatComponent`, `SidePanelComponent`) to provide a stub `TerminalService` via the DI token so tests can run.

### 2025-12-14
- Completed Terminal UI integration and end-to-end verification in the app shell.
- Fixed unit test DI issues by providing `TERMINAL_SERVICE` test providers/stubs in affected specs; all terminal-related tests now pass.
- Persisted terminal history per session and verified redaction/share toggles.
- Updated task status to Completed and set overall completion to 100%.
