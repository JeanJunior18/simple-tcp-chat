import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  setUsername: (username: string) =>
    ipcRenderer.invoke("set-username", username),
  sendMessage: (msg: string) => ipcRenderer.invoke("send-message", msg),
  onMessage: (callback: (msg: string) => void) =>
    ipcRenderer.on("new-message", (_, msg) => callback(msg)),
  onConnect: (callback: (msg: string) => void) =>
    ipcRenderer.on("connected", (_, msg) => callback(msg)),
});
