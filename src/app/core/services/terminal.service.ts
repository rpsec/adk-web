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

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {
    TerminalContext,
    TerminalService as TerminalServiceInterface,
    TerminalSettings,
} from './interfaces/terminal';

interface PersistedTerminalState {
  tailLines: string[];
  fullLines?: string[];
  pendingFragment?: string;
}

const DEFAULT_TAIL_LINES = 20;
const MAX_FULL_LINES = 2000;
const STORAGE_KEY_PREFIX = 'adk-web:terminal';

@Injectable({
  providedIn: 'root',
})
export class TerminalService extends TerminalServiceInterface {
  private context: TerminalContext | null = null;

  private readonly settingsSubject = new BehaviorSubject<TerminalSettings>({
    shareWithAgentEnabled: false,
    shareFullHistoryEnabled: false,
    redactionEnabled: true,
    persistenceEnabled: false,
  });
  readonly settings$: Observable<TerminalSettings> =
      this.settingsSubject.asObservable();

  private tailLines: string[] = [];
  private fullLines: string[] = [];
  private pendingFragment = '';

  setContext(context: TerminalContext): void {
    const sameContext =
        this.context?.appName === context.appName &&
        this.context?.userId === context.userId &&
        this.context?.sessionId === context.sessionId;
    this.context = context;

    if (!sameContext) {
      this.loadIfEnabled();
    }
  }

  clear(): void {
    this.tailLines = [];
    this.fullLines = [];
    this.pendingFragment = '';
    this.persistIfEnabled();
  }

  appendOutput(text: string): void {
    if (!text) return;

    // Normalize newlines and preserve partial trailing fragments.
    const combined = this.pendingFragment + text;
    const parts = combined.split(/\r?\n/);

    const endsWithNewline = /\r?\n$/.test(combined);
    const completedLines = endsWithNewline ? parts.slice(0, -1) : parts.slice(0, -1);
    const trailing = endsWithNewline ? '' : parts[parts.length - 1] ?? '';

    for (const line of completedLines) {
      this.appendLineInternal(line);
    }

    this.pendingFragment = trailing;

    // If we ended with a newline, we already captured the final empty fragment.
    this.persistIfEnabled();
  }

  appendLine(line: string): void {
    this.appendLineInternal(line);
    this.persistIfEnabled();
  }

  getTailLines(maxLines: number = DEFAULT_TAIL_LINES): string[] {
    const lines = this.pendingFragment ? [...this.tailLines, this.pendingFragment] : [...this.tailLines];
    return lines.slice(Math.max(0, lines.length - maxLines));
  }

  getFullLines(): string[] {
    return this.pendingFragment ? [...this.fullLines, this.pendingFragment] : [...this.fullLines];
  }

  getAgentContextPrefix(): string | null {
    const settings = this.settingsSubject.value;
    if (!settings.shareWithAgentEnabled) return null;

    const lines = settings.shareFullHistoryEnabled ? this.getFullLines() : this.getTailLines(DEFAULT_TAIL_LINES);
    if (lines.length === 0) return null;

    const raw = lines.join('\n');
    const text = settings.redactionEnabled ? this.redact(raw) : raw;

    const label = settings.shareFullHistoryEnabled ? 'full history' : `last ${DEFAULT_TAIL_LINES} lines`;
    return `\n\n---\nTerminal (${label}):\n${text}\n---\n\n`;
  }

  updateSettings(settings: Partial<TerminalSettings>): void {
    const next = {...this.settingsSubject.value, ...settings};

    // Guard: cannot share full history unless sharing is enabled.
    if (!next.shareWithAgentEnabled) {
      next.shareFullHistoryEnabled = false;
    }

    this.settingsSubject.next(next);

    // If persistence is toggled on, attempt a load now.
    if (settings.persistenceEnabled === true) {
      this.loadIfEnabled();
    }

    // If persistence is toggled off, we leave previously stored state in place.
  }

  private appendLineInternal(line: string): void {
    this.tailLines.push(line);
    if (this.tailLines.length > DEFAULT_TAIL_LINES) {
      this.tailLines = this.tailLines.slice(this.tailLines.length - DEFAULT_TAIL_LINES);
    }

    this.fullLines.push(line);
    if (this.fullLines.length > MAX_FULL_LINES) {
      this.fullLines = this.fullLines.slice(this.fullLines.length - MAX_FULL_LINES);
    }
  }

  private persistIfEnabled(): void {
    const {persistenceEnabled, redactionEnabled} = this.settingsSubject.value;
    if (!persistenceEnabled || !this.context) return;

    try {
      const state: PersistedTerminalState = {
        tailLines: redactionEnabled ? this.tailLines.map((l) => this.redact(l)) : this.tailLines,
        fullLines: redactionEnabled ? this.fullLines.map((l) => this.redact(l)) : this.fullLines,
        pendingFragment: redactionEnabled ? this.redact(this.pendingFragment) : this.pendingFragment,
      };
      window.localStorage.setItem(this.storageKey(), JSON.stringify(state));
    } catch {
      // Best-effort only.
    }
  }

  private loadIfEnabled(): void {
    const {persistenceEnabled} = this.settingsSubject.value;
    if (!persistenceEnabled || !this.context) return;

    try {
      const raw = window.localStorage.getItem(this.storageKey());
      if (!raw) return;
      const parsed = JSON.parse(raw) as PersistedTerminalState;
      this.tailLines = Array.isArray(parsed.tailLines) ? parsed.tailLines : [];
      this.fullLines = Array.isArray(parsed.fullLines) ? parsed.fullLines : [];
      this.pendingFragment = typeof parsed.pendingFragment === 'string' ? parsed.pendingFragment : '';
    } catch {
      // Best-effort only.
    }
  }

  private storageKey(): string {
    // Scope per-session.
    const ctx = this.context;
    return `${STORAGE_KEY_PREFIX}:${ctx?.appName ?? ''}:${ctx?.userId ?? ''}:${ctx?.sessionId ?? ''}`;
  }

  private redact(text: string): string {
    if (!text) return text;

    // Conservative, dependency-free redactions.
    const jwt = /\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/g;
    const bearer = /\bBearer\s+[A-Za-z0-9\-._~+/]+=*\b/g;
    const keyValue = /(api[_-]?key|token|secret|password)\s*[:=]\s*([^\s]+)/ig;

    return text
        .replace(jwt, '[REDACTED_JWT]')
        .replace(bearer, 'Bearer [REDACTED_TOKEN]')
        .replace(keyValue, (_m, key) => `${key}: [REDACTED]`);
  }
}
