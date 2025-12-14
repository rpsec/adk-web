/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface TerminalContext {
  appName: string;
  userId: string;
  sessionId: string;
}

export interface TerminalSettings {
  /** Whether terminal history is included in agent prompts (Option A). */
  shareWithAgentEnabled: boolean;
  /** Whether to share full history (otherwise only the tail is shared). */
  shareFullHistoryEnabled: boolean;
  /** Whether redaction is applied before sharing/persisting. */
  redactionEnabled: boolean;
  /** Whether history should be persisted in localStorage per session. */
  persistenceEnabled: boolean;
}

export const TERMINAL_SERVICE = new InjectionToken<TerminalService>(
    'TerminalService',
);

export abstract class TerminalService {
  abstract readonly settings$: Observable<TerminalSettings>;

  /** Updates the active session context for persistence scoping. */
  abstract setContext(context: TerminalContext): void;

  /** Clears history for the active session context. */
  abstract clear(): void;

  /** Writes text to history, splitting on newlines. */
  abstract appendOutput(text: string): void;

  /** Writes a single logical line to history (no splitting). */
  abstract appendLine(line: string): void;

  /** Returns the last N lines (including a partial trailing line if any). */
  abstract getTailLines(maxLines?: number): string[];

  /** Returns the full transcript (including a partial trailing line if any). */
  abstract getFullLines(): string[];

  /** Returns a formatted, optionally redacted prefix for agent prompts. */
  abstract getAgentContextPrefix(): string | null;

  abstract updateSettings(settings: Partial<TerminalSettings>): void;
}
