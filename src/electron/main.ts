import { TcpChatNode } from "../core/TcpChat";
import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";

let chatCore: TcpChatNode;

function createWindow() {
  const mainWindow = new BrowserWindow({
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
  } else {
    const indexPath = path.join(__dirname, "../renderer/index.html");
    console.log("📦 PROD mode: carregando build", indexPath);
    mainWindow.loadFile(indexPath);
  }
}
app.whenReady().then(async () => {
  chatCore = new TcpChatNode();
  let username: string;
  createWindow();

  ipcMain.handle("set-username", async (_event, name) => {
    if (username) return;
    username = name;
    await chatCore.start(name);

    chatCore.onMessage((msg) => {
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send("new-message", msg);
      });
    });

    chatCore.onConnect((username) => {
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send("connected", username);
      });
    });

    chatCore.onError((err) => {
      console.error("Erro no TcpChatNode:", err);
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send("chat-error", {
          name: err.name,
          message: err.message,
          stack: err.stack,
        });
      });
    });
  });

  ipcMain.handle("send-message", (_event, msg: string) => {
    if (!username) return;
    chatCore.sendTextMessage(msg);
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
