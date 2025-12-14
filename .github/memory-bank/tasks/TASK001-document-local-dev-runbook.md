# TASK001 - Document Local Dev Runbook

**Status:** Pending  
**Added:** 2025-12-13  
**Updated:** 2025-12-13

## Original Request
Derived follow-up task after aligning the Memory Bank: verify and document the end-to-end local development workflow.

## Thought Process
The repo includes a custom workflow where `npm run serve` injects the backend URL into `src/assets/config/runtime-config.json`, and the UI expects an ADK API server running with CORS configured. Having a single runbook reduces setup friction and prevents common misconfigurations.

## Implementation Plan
- Verify the exact `npm` commands and runtime-config injection behavior
- Verify recommended backend startup commands (ADK CLI) and required flags (CORS/origins)
- Capture expected ports and troubleshooting steps (missing `--backend`, empty backendUrl, WebSocket host)
- Add concise documentation references to key scripts and entrypoints

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks
| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 1.1 | Validate frontend startup command | Not Started | 2025-12-13 | `npm run serve --backend=...` |
| 1.2 | Validate backend startup command | Not Started | 2025-12-13 | `adk api_server ...` |
| 1.3 | Document CORS + WebSocket behavior | Not Started | 2025-12-13 | Origins, scheme handling |
| 1.4 | Write runbook doc location decision | Not Started | 2025-12-13 | Likely README extension or dedicated docs |

## Progress Log
### 2025-12-13
- Task created while updating Memory Bank; implementation not started
