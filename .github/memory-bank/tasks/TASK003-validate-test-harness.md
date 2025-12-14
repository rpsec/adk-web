# TASK003 - Validate Test Harness

**Status:** In Progress  
**Added:** 2025-12-13  
**Updated:** 2025-12-13

## Original Request
Derived follow-up task after aligning the Memory Bank: validate and standardize unit testing setup.

## Thought Process
The README calls out a critical ordering requirement: `initTestBed()` must be called before `TestBed.configureTestingModule()`. This is easy to miss and can lead to confusing test failures. Standardizing test templates and documenting the rule helps maintain long-term stability.

## Implementation Plan
- Inspect `src/app/testing/utils.ts` and understand what `initTestBed()` sets up
- Scan existing specs for compliance
- If patterns vary, standardize by updating specs (only where needed)
- Document the rule in a developer-facing doc and in the Memory Bank

## Progress Tracking

**Overall Status:** In Progress - 20%

### Subtasks
| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 3.1 | Review `initTestBed()` implementation | Not Started | 2025-12-13 | Identify required ordering rationale |
| 3.2 | Audit specs for compliance | In Progress | 2025-12-13 | `npm test` revealed broad DI failures for `TERMINAL_SERVICE` |
| 3.3 | Standardize tests (if needed) | Not Started | 2025-12-13 | Add mock providers in impacted specs and/or shared setup |
| 3.4 | Document test conventions | Not Started | 2025-12-13 | Include quick template/snippet |

## Progress Log
### 2025-12-13
- Task created while updating Memory Bank; implementation not started

### 2025-12-13
- Ran `npm test` and observed many failures caused by `NullInjectorError: No provider for InjectionToken TerminalService!`.
- Root cause: new terminal integration introduced `TERMINAL_SERVICE` injection into components, but existing specs don’t provide the token.
- Next fix: add a lightweight mock/stub `TerminalService` provider in affected component specs (and/or via shared `initTestBed()` setup) and re-run `npm test`.
