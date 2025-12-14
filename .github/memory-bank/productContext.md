# Product Context

## Why This Project Exists
Agent Development Kit (ADK) enables developers to build and deploy AI agents, but agent iteration is fastest when developers can **observe and debug** agent behavior.

This project provides a **built-in developer UI** for ADK to:
- Run and interact with agents during development
- Inspect run state (sessions)
- Debug behavior via events, traces, and artifacts
- Review evaluations and diagnostics

## Target Users
- Agent developers using ADK (Python or Java)
- Debugging / testing workflows during local development

## User Experience Goals
1. **Fast feedback loop**: minimal friction to connect UI to a backend and start iterating.
2. **Observability-first**: make traces/events/artifacts easy to find and interpret.
3. **Safe display of rich content**: render Markdown and artifacts without compromising UI safety.
4. **Developer-friendly tooling**: code editor, JSON/YAML tooling, and builder features where relevant.

## How It Should Work (Conceptual)
1. Developer runs an ADK API server locally.
2. Developer launches this UI and points it at the API server (via runtime config injection).
3. UI uses HTTP and WebSocket connections to:
	- list/create sessions
	- stream chat and events
	- fetch traces and artifacts
	- run/view evaluations

## Key Differentiators
- Tight integration with ADK dev workflows
- Rich debugging surfaces (events/tracing/artifacts/evals) rather than chat-only
- Angular + Material implementation with modular, standalone components
