import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  isElectron: true,
  sendInput: (data: string) => ipcRenderer.send("terminal-input", data),
  resize: (cols: number, rows: number) =>
    ipcRenderer.send("terminal-resize", { cols, rows }),
  init: () => ipcRenderer.send("terminal-init"),
  onOutput: (callback: (data: string) => void) => {
    ipcRenderer.on("terminal-incoming", (event, data) => callback(data));
  },
});
