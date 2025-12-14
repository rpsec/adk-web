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

import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    input,
    OnChanges,
    SimpleChanges,
    viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import { firstValueFrom } from 'rxjs';

import { TERMINAL_SERVICE, TerminalContext, TerminalSettings } from '../../core/services/interfaces/terminal';
import { TERMINAL_COMMAND_SERVICE } from '../../core/services/interfaces/terminal-command';

const PROMPT = '$ ';

@Component({
  selector: 'app-terminal-tab',
  templateUrl: './terminal-tab.component.html',
  styleUrls: ['./terminal-tab.component.scss'],
  standalone: true,
  imports: [CommonModule, MatSlideToggleModule, MatButtonModule],
})
export class TerminalTabComponent implements AfterViewInit, OnChanges {
  readonly appName = input('');
  readonly userId = input('');
  readonly sessionId = input('');

  readonly terminalContainer = viewChild.required<ElementRef<HTMLElement>>(
      'terminalContainer',
  );

  private readonly destroyRef = inject(DestroyRef);
  private readonly terminalService = inject(TERMINAL_SERVICE);
  private readonly terminalCommandService = inject(TERMINAL_COMMAND_SERVICE);

  readonly settings = toSignal(this.terminalService.settings$, {
    initialValue: {
      shareWithAgentEnabled: false,
      shareFullHistoryEnabled: false,
      redactionEnabled: true,
      persistenceEnabled: false,
    } satisfies TerminalSettings,
  });

  private xterm: Terminal | null = null;
  private fitAddon: FitAddon | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private currentInput = '';
  private isRunningCommand = false;

  ngAfterViewInit(): void {
    this.initTerminal();
    this.syncContextToService();
    this.renderFromHistory();
    this.printPrompt();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appName'] || changes['userId'] || changes['sessionId']) {
      this.syncContextToService();
      this.renderFromHistory();
    }
  }

  updateSetting<K extends keyof TerminalSettings>(
      key: K,
      value: TerminalSettings[K],
  ): void {
    this.terminalService.updateSettings({[key]: value} as Partial<TerminalSettings>);
  }

  clearTerminal(): void {
    this.terminalService.clear();
    this.xterm?.clear();
    this.currentInput = '';
    this.isRunningCommand = false;
    this.printPrompt();
  }

  private initTerminal(): void {
    const term = new Terminal({
      cursorBlink: true,
      scrollback: 2000,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(this.terminalContainer().nativeElement);
    fitAddon.fit();

    this.resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
      } catch {
        // Best-effort only.
      }
    });
    this.resizeObserver.observe(this.terminalContainer().nativeElement);

    term.onData((data: string) => void this.handleTerminalData(data));

    this.xterm = term;
    this.fitAddon = fitAddon;

    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();
      this.resizeObserver = null;
      this.xterm?.dispose();
      this.xterm = null;
      this.fitAddon = null;
    });
  }

  private syncContextToService(): void {
    const ctx = this.buildContext();
    if (!ctx) return;
    this.terminalService.setContext(ctx);
  }

  private buildContext(): TerminalContext | null {
    const appName = this.appName();
    const userId = this.userId();
    const sessionId = this.sessionId();

    if (!appName || !userId || !sessionId) return null;
    return {appName, userId, sessionId};
  }

  private renderFromHistory(): void {
    if (!this.xterm) return;

    // Replace xterm buffer with stored transcript.
    this.xterm.reset();
    const lines = this.terminalService.getFullLines();
    if (lines.length > 0) {
      this.xterm.writeln(lines.join('\n'));
    }

    this.currentInput = '';
    this.isRunningCommand = false;
    this.printPrompt();
  }

  private printPrompt(): void {
    if (!this.xterm) return;

    // Avoid duplicating prompts when re-rendering.
    const bufferLine = this.xterm.buffer.active.getLine(
        this.xterm.buffer.active.cursorY,
    );
    const current = bufferLine?.translateToString(true) ?? '';
    if (current.endsWith(PROMPT)) {
      return;
    }

    this.xterm.write(PROMPT);
  }

  private async handleTerminalData(data: string): Promise<void> {
    if (!this.xterm) return;

    // Allow Ctrl+C to cancel input locally.
    if (data === '\u0003') {
      this.xterm.write('^C\r\n');
      this.currentInput = '';
      this.isRunningCommand = false;
      this.printPrompt();
      return;
    }

    if (this.isRunningCommand) {
      return;
    }

    // Enter
    if (data === '\r') {
      const command = this.currentInput.trim();
      this.xterm.write('\r\n');

      if (!command) {
        this.currentInput = '';
        this.printPrompt();
        return;
      }

      await this.runCommand(command);
      return;
    }

    // Backspace
    if (data === '\u007f') {
      if (this.currentInput.length > 0) {
        this.currentInput = this.currentInput.slice(0, -1);
        this.xterm.write('\b \b');
      }
      return;
    }

    // Printable input (including paste)
    this.currentInput += data;
    this.xterm.write(data);
  }

  private async runCommand(command: string): Promise<void> {
    const ctx = this.buildContext();
    if (!ctx) {
      this.xterm?.writeln('Missing session context; select/create a session first.');
      this.currentInput = '';
      this.printPrompt();
      return;
    }

    this.isRunningCommand = true;

    // Record and echo the command.
    this.terminalService.appendLine(`${PROMPT}${command}`);

    try {
      const res = await firstValueFrom(
          this.terminalCommandService.executeCommand({...ctx, command}),
      );

      const output = this.normalizeResponseOutput(res);
      if (output) {
        this.xterm?.write(output);
        this.terminalService.appendOutput(output);

        if (!/\r?\n$/.test(output)) {
          this.xterm?.write('\r\n');
          this.terminalService.appendOutput('\n');
        }
      }

      if (typeof res.exitCode === 'number' && res.exitCode !== 0) {
        const exitLine = `[exit ${res.exitCode}]`;
        this.xterm?.writeln(exitLine);
        this.terminalService.appendLine(exitLine);
      }
    } catch (e: unknown) {
      const msg = 'Command failed; check backend logs.';
      this.xterm?.writeln(msg);
      this.terminalService.appendLine(msg);
    } finally {
      this.isRunningCommand = false;
      this.currentInput = '';
      this.printPrompt();
    }
  }

  private normalizeResponseOutput(res: {output?: string; stdout?: string; stderr?: string}): string {
    if (res.output) return res.output;
    const stdout = res.stdout ?? '';
    const stderr = res.stderr ?? '';
    return `${stdout}${stderr}`;
  }
}
