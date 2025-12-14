import { app, BrowserWindow, ipcMain } from "electron";
import * as pty from "node-pty";
import * as os from "os";
import * as path from "path";

let win: BrowserWindow | null = null;
const ptySessions: { [key: string]: pty.IPty } = {};

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load the angular app.
  // In dev, we might load localhost:4200. In prod, load dist/index.html.
  const isDev = process.argv.includes("--dev");
  if (isDev) {
    win.loadURL("http://localhost:4200");
    win.webContents.openDevTools();
  } else {
    win.loadFile(
      path.join(__dirname, "../../dist/agent_framework_web/index.html")
    );
  }

  win.on("closed", () => {
    win = null;
  });
}

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

ipcMain.on("terminal-init", (event) => {
  const ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: process.env["HOME"],
    env: process.env as any,
  });

  const pid = ptyProcess.pid.toString();
  ptySessions[pid] = ptyProcess;

  ptyProcess.onData((data) => {
    if (win) {
      win.webContents.send("terminal-incoming", data);
    }
  });

  // Notify renderer that shell is ready (optional, or just start sending data)
});

ipcMain.on("terminal-input", (event, data) => {
  // For now, we only support one session or assuming single active session logic for MVP
  // Ideally we track which session the input is for.
  // We'll iterate for now or store a single active one suitable for the demo.
  // Let's just use the the last created one or refactor to single for now.
  const keys = Object.keys(ptySessions);
  if (keys.length > 0) {
    ptySessions[keys[0]].write(data);
  } else {
    // Init if not exists?
    // Better to have explicit init.
  }
});

ipcMain.on("terminal-resize", (event, { cols, rows }) => {
  const keys = Object.keys(ptySessions);
  if (keys.length > 0) {
    ptySessions[keys[0]].resize(cols, rows);
  }
});

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});
