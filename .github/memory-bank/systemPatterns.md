# System Patterns

## Architecture Overview
adk-web is a single Angular application (Angular 19) organized around:
- Standalone UI components under `src/app/components/`
- Domain services under `src/app/core/services/` with interface tokens under `src/app/core/services/interfaces/`
- Shared models under `src/app/core/models/`

The UI depends on a separate ADK API server and uses a runtime-configured base URL.

## Key Technical Decisions

### 1. Runtime Config Loaded Before Bootstrap
- **What**: The app fetches `./assets/config/runtime-config.json` before `bootstrapApplication()`.
- **Why**: Allows environment-specific configuration without rebuilding the app.
- **Where**: `src/main.ts` fetches config and assigns `(window as any)['runtimeConfig']`.
- **Pattern**: Runtime config as a global, accessed via `RuntimeConfigUtil.getRuntimeConfig()`.

### 2. Backend URL Injection via npm Script
- **What**: `npm run serve --backend=http://...` writes `src/assets/config/runtime-config.json`.
- **Why**: Keeps local dev setup simple and explicit.
- **Where**: `set-backend.js` reads `process.env.npm_config_backend` and writes JSON.
- **Pattern**: Pre-serve script stage: clean + inject + `ng serve`.

### 3. Dependency Injection via Interface Tokens
- **What**: Core services are bound through tokens (e.g., `SESSION_SERVICE`, `AGENT_SERVICE`).
- **Why**: Enables swapping implementations in tests and reduces tight coupling.
- **Where**: Providers are registered in `src/main.ts`.
- **Pattern**: `interfaces/*` define tokens; `core/services/*` provide implementations.

### 4. HTTP + WebSocket Integration
- **What**: Services use an API base URL and WebSocket server derived from runtime config.
- **Why**: Supports both request/response and streaming/live updates.
- **Where**: `src/utils/url-util.ts` provides base URL derivation.

## Testing Pattern / Quirk
To maintain upstream compatibility, tests must call `initTestBed()` (from `src/app/testing/utils.ts`) before `TestBed.configureTestingModule()`.

## Security / Safety Patterns
- Rich content rendering (Markdown, artifacts) should pass through the project’s safe-values utilities/services.
- Backend URL is treated as configuration; UI should not assume a fixed host/port.
