import { CommonModule } from "@angular/common";
import { Component, HostBinding } from "@angular/core";

import { ChatComponent } from "../chat/chat.component";
import { ThemeToggle } from "../theme-toggle/theme-toggle";

const NAV_COLLAPSE_KEY = "app-shell.navCollapsed";

@Component({
  selector: "app-shell",
  standalone: true,
  imports: [CommonModule, ChatComponent, ThemeToggle],
  templateUrl: "./app-shell.component.html",
  styleUrls: ["./app-shell.component.scss"],
})
export class AppShellComponent {
  @HostBinding("class.nav-collapsed") navCollapsed = false;

  constructor() {
    const stored = localStorage.getItem(NAV_COLLAPSE_KEY);
    this.navCollapsed = stored === "true";
  }

  toggleNav(): void {
    this.navCollapsed = !this.navCollapsed;
    try {
      localStorage.setItem(NAV_COLLAPSE_KEY, String(this.navCollapsed));
    } catch {
      // Ignore storage failures (e.g., private mode).
    }
  }

  onRun(): void {
    // TODO: Hook into run action service once available.
  }

  onSave(): void {
    // TODO: Hook into save/export flow once available.
  }
}
