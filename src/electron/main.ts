import { TcpChatNode } from "../core/TcpChat";
import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";

let chatCore: TcpChatNode;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      console.error("❌ Failed to load:", errorDescription);
    }
  );

  if (process.env.NODE_ENV?.trim() == "development") {
    console.log("🔧 DEV mode: carregando Vite dev server");
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    console.log("📦 PROD mode: carregando build");
    mainWindow.loadFile(path.join(__dirname, "../index.html"));
  }
}
app.whenReady().then(async () => {
  chatCore = new TcpChatNode();
  await chatCore.start();

  ipcMain.handle("send-message", (_event, msg: string) => {
    chatCore.sendTextMessage(msg);
  });

  chatCore.onMessage((msg) => {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send("new-message", msg);
    });
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
