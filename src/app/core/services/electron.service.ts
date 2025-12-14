import { Injectable, NgZone } from "@angular/core";
import { Subject } from "rxjs";

export interface ElectronApi {
  isElectron: boolean;
  sendInput: (data: string) => void;
  resize: (cols: number, rows: number) => void;
  init: () => void;
  onOutput: (callback: (data: string) => void) => void;
}

declare global {
  interface Window {
    electron: ElectronApi;
  }
}

@Injectable({
  providedIn: "root",
})
export class ElectronService {
  private outputSubject = new Subject<string>();
  readonly output$ = this.outputSubject.asObservable();

  constructor(private ngZone: NgZone) {
    if (this.isElectron) {
      window.electron.onOutput((data) => {
        this.ngZone.run(() => {
          this.outputSubject.next(data);
        });
      });
    }
  }

  get isElectron(): boolean {
    return !!(window && window.electron && window.electron.isElectron);
  }

  sendInput(data: string): void {
    if (this.isElectron) {
      window.electron.sendInput(data);
    }
  }

  resize(cols: number, rows: number): void {
    if (this.isElectron) {
      window.electron.resize(cols, rows);
    }
  }

  init(): void {
    if (this.isElectron) {
      window.electron.init();
    }
  }
}
