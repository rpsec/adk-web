# Technical Context

## Technology Stack

### Frontend
- **Framework**: Angular 19 (standalone bootstrap via `bootstrapApplication`)
- **Language**: TypeScript ~5.7
- **UI**: Angular Material + Angular CDK
- **Reactive**: RxJS ~7.8
- **Rich content**: `ngx-markdown`, `ngx-json-viewer`, `vanilla-jsoneditor`
- **Editor / visualization**: CodeMirror 6 (Python mode), `@viz-js/viz`, `ngx-vflow`

### Backend (External Dependency)
- A separate ADK API server (commonly started via the ADK CLI, e.g. `adk api_server`).
- The UI targets the backend via `backendUrl` provided at runtime.

## Build / Run / Test
- **Package manager**: npm
- **Dev server**: Angular CLI (`ng serve`)
- **Tests**: Karma + Jasmine (`ng test`)

Key npm scripts (from `package.json`):
- `npm run serve --backend=http://localhost:8000` (recommended for local dev)
- `npm run build`
- `npm test`

## Runtime Configuration
- File: `src/assets/config/runtime-config.json`
- Injected by scripts:
  - `clean-backend.js` resets the config
  - `set-backend.js` writes `{ "backendUrl": "..." }` using `--backend=...`
- Loaded during app startup in `src/main.ts` via `fetch('./assets/config/runtime-config.json')` and stored on `window.runtimeConfig`.

## Notable Repository Conventions
- Standalone components are used heavily (components specify `imports: [...]`).
- Service implementations are provided via DI tokens declared in `src/app/core/services/interfaces/` and wired in `src/main.ts`.
- Testing quirk (from README): tests must call `initTestBed()` (from `src/app/testing/utils.ts`) before `TestBed.configureTestingModule()`.

## External Links (Product)
- ADK docs: https://google.github.io/adk-docs/
- ADK samples: https://github.com/google/adk-samples
