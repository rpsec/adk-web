## Plan: Add xterm.js Terminal Panel (Option A + toggle/redaction + optional persistence)

Implement a new “Terminal” tab in the existing Side Panel using xterm.js. Back it with a `TerminalService` that always keeps a 20-line ring buffer, optionally keeps a full transcript behind an explicit user toggle, and supports optional persistence (tail by default). Expose terminal history to agents via Option A: prepend terminal history into the outgoing user message content at send-time, with optional redaction applied before it’s appended.

### Steps
1. Locate the real send pipeline (it’s not in src/app/app.component.ts) and identify the exact “user message text → LLM run” method to hook.
2. Add xterm dependencies and styles in package.json and src/styles.scss; decide whether to include the Fit addon for resizing.
3. Create TerminalService modeled after src/app/core/services/feature-flags.service.ts: maintain `tailLines` (ring buffer, size 20) + `fullLines` (only when enabled).
4. Add TerminalComponent and mount as a new Side Panel tab alongside Trace/Events/etc. using the existing side-panel tabs template; initialize xterm and render output from TerminalService.
5. Implement Option A agent-access: on “Send”, prepend a “Terminal (last 20 lines): …” block into the user’s text; when toggle is enabled, prepend “Terminal (full history): …” instead.
6. Add explicit UI toggles: “Share terminal with agent” (off by default) and “Share full terminal history” (disabled unless sharing is enabled).
7. Add optional redaction (no new deps): apply a small set of regex-based redactions in TerminalService (or right before injection) when “share” is enabled.
8. Add optional persistence: store tail (and full transcript only if enabled) keyed by session identifier; restore on session load/switch, and clear on session reset.

### Further Considerations
1. Injection format: keep it as a clearly delimited prefix so users can still see/ edit the actual prompt easily.
2. Persistence policy: persist tail only by default; full transcript persistence should be opt-in and can cap at a max line count to avoid unbounded growth.
3. Redaction scope: start with conservative patterns (API keys/JWT-like strings) and make the rule set user-configurable only if you later need it.

One blocking detail before refinement: do you want the terminal to be interactive (user types commands that run somewhere) or display-only (stream logs/tool output only)?
