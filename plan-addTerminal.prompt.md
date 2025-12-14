## Plan: Add xterm.js Terminal Panel

Integrate an in-app terminal as a new Side Panel tab using xterm.js, backed by a `TerminalService` that maintains a 20-line ring buffer (default) plus an optional full transcript when the user enables it. Expose terminal history to “agents” by attaching the tail (or full transcript) to outgoing agent runs via the existing `RunRequest` pipeline, without introducing new pages or routing changes.

### Steps
1. Confirm terminal scope (interactive PTY vs display-only) and history scope (per session vs global tab).
2. Add xterm dependencies in [package.json](package.json) and wire xterm CSS via global styles in [src/styles.scss](src/styles.scss).
3. Create `TerminalService` using existing injection-token patterns from [src/app/injection_tokens.ts](src/app/injection_tokens.ts) and store patterns from [src/app/core/services/feature-flags.service.ts](src/app/core/services/feature-flags.service.ts); implement 20-line ring buffer + optional full transcript.
4. Add a `TerminalComponent` and mount it as a new tab in the Side Panel (start from [src/app/components/side-panel/side-panel.component.html](src/app/components/side-panel/side-panel.component.html) and [src/app/components/side-panel/side-panel.component.ts](src/app/components/side-panel/side-panel.component.ts)); initialize xterm and keep it resized (Fit addon) with the existing resizable layout.
5. Wire “agent access” to terminal history by extending the run pipeline in [src/app/app.component.ts](src/app/app.component.ts) and/or [src/app/core/services/llm.service.ts](src/app/core/services/llm.service.ts): attach `TerminalService.getTail(20)` by default, and `getTranscript()` only when the user opts in.
6. Add focused unit tests for history behavior (ring buffer boundaries, transcript toggle) alongside existing patterns (e.g., [src/app/utils/yaml-utils.spec.ts](src/app/utils/yaml-utils.spec.ts)).

### Further Considerations
1. History injection approach: Option A “prepend to user message” vs Option B “store in `RunRequest.state`” (cleaner, but depends on backend preserving state).
2. Full transcript risk: memory growth + accidental secret leakage; recommend explicit toggle + optional redaction rules.
3. Persistence: keep in-memory by default; optionally persist tail per `sessionId` if you need continuity across reloads.

If you answer just these two, the plan can be finalized tightly: should the terminal be interactive (send input somewhere) or display-only, and should history be scoped per chat `sessionId` or per browser tab?
