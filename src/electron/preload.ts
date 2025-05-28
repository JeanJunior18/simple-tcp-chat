import { contextBridge, ipcRenderer } from "electron";
console.log('Preload success loaded!');
contextBridge.exposeInMainWorld("api", {
  send: (channel: string, ...args: any[]) => {
    const validChannels = ["toMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },
  receive: (channel: string, func: (...args: any[]) => void) => {
    const validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  on: (channel: string, func: (...args: any[]) => void) => {
    const validChannels = ["eventChannel"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});
