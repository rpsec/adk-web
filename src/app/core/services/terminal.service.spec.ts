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

import { TestBed } from '@angular/core/testing';

import {
    initTestBed,
} from '../../testing/utils';

import { TerminalService } from './terminal.service';

describe('TerminalService', () => {
  let service: TerminalService;

  beforeEach(() => {
    initTestBed();
    TestBed.configureTestingModule({
      providers: [TerminalService],
    });
    service = TestBed.inject(TerminalService);

    // Ensure a clean storage state for persistence tests.
    window.localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('keeps only the last 20 tail lines', () => {
    for (let i = 0; i < 25; i++) {
      service.appendLine(`line-${i}`);
    }

    const tail = service.getTailLines();
    expect(tail.length).toBe(20);
    expect(tail[0]).toBe('line-5');
    expect(tail[19]).toBe('line-24');
  });

  it('handles partial line fragments in appendOutput', () => {
    service.appendOutput('hello');
    expect(service.getTailLines()).toEqual(['hello']);

    service.appendOutput(' world\nnext');
    expect(service.getTailLines()).toEqual(['hello world', 'next']);
  });

  it('builds agent context prefix using tail by default', () => {
    service.appendLine('a');
    service.appendLine('b');

    service.updateSettings({shareWithAgentEnabled: true});
    const prefix = service.getAgentContextPrefix();

    expect(prefix).toContain('Terminal (last 20 lines)');
    expect(prefix).toContain('a\nb');
  });

  it('applies redaction in shared context when enabled', () => {
    service.appendLine('Authorization: Bearer abc.def.ghi');
    service.updateSettings({
      shareWithAgentEnabled: true,
      redactionEnabled: true,
    });

    const prefix = service.getAgentContextPrefix() ?? '';
    expect(prefix).toContain('Bearer [REDACTED_TOKEN]');
  });

  it('loads and persists per-session when enabled', () => {
    service.setContext({appName: 'app', userId: 'user', sessionId: 's1'});
    service.updateSettings({persistenceEnabled: true});

    service.appendLine('persist-me');

    // New service instance should read from localStorage on setContext.
    const service2 = new TerminalService();
    service2.setContext({appName: 'app', userId: 'user', sessionId: 's1'});
    service2.updateSettings({persistenceEnabled: true});

    expect(service2.getTailLines()).toContain('persist-me');
  });
});
