import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";

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

  mainWindow.webContents.on("plugin-crashed", () => {
    console.error("💥 Renderer process crashed!");
  });

  if (process.env.NODE_ENV?.trim() == "development") {
    console.log("🔧 DEV mode: carregando Vite dev server");
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    console.log("📦 PROD mode: carregando build");
    mainWindow.loadFile(path.join(__dirname, "../index.html"));
  }
}
app.disableHardwareAcceleration();
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
