# TASK002 - Inventory Backend Contracts

**Status:** Pending  
**Added:** 2025-12-13  
**Updated:** 2025-12-13

## Original Request
Derived follow-up task after aligning the Memory Bank: document which backend APIs (HTTP + WebSocket) the UI depends on.

## Thought Process
The UI’s services build URLs from `runtimeConfig.backendUrl` and likely assume a specific set of endpoints. Capturing this contract (routes, request/response shapes, WebSocket event types) reduces integration drift across ADK backends and makes debugging easier.

## Implementation Plan
- Enumerate all usages of the API base URL in services
- Identify HTTP routes used by each service (sessions, agents, events, traces, artifacts, eval)
- Identify WebSocket connection patterns and message/event types
- Consolidate into a contract doc with a short per-surface mapping

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks
| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 2.1 | Map service -> routes usage | Not Started | 2025-12-13 | Search `http` / `HttpClient` calls |
| 2.2 | Map service -> WS usage | Not Started | 2025-12-13 | Inspect `websocket.service.ts` |
| 2.3 | Document response shapes | Not Started | 2025-12-13 | Use models in `src/app/core/models/` |
| 2.4 | Write contract summary | Not Started | 2025-12-13 | Short, linkable doc |

## Progress Log
### 2025-12-13
- Task created while updating Memory Bank; implementation not started
