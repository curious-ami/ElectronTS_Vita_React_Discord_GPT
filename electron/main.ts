import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

let win: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

function createWindow() {
  win = new BrowserWindow({
    frame: false,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      nodeIntegration: true,
      //enableRemoteModule: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.setMenuBarVisibility(false);
  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, "index.html"));
  }
  win.webContents.openDevTools();
  win.webContents.executeJavaScript(`console.log("Hello from runtime!");`);
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);

//АПИ с веб страницой
type Args = { method: string; data?: any };
ipcMain.handle("ToMain", async (_, args: Args) => {
  if (args.method === "hi") {
    //await window.api.invoke({method: 'hi'});
    return "hi from electron";
  }
});

export type SendMethod = 'window-control' | 'save-file';
ipcMain.on("ToMain", async (_, method: SendMethod, data?: string | object) => {  
  if (method === "window-control") {
    windowControl(data);
  }
});

function windowControl(data: any){
  if (!win) return;
  if(data === 'close-btn') win.close();

  if(data === 'min-btn') win.minimize();

  if (data === 'max-btn'){
    if(!win.isMaximized()){
        win.maximize();
    }  else {
        win.unmaximize();
    }
  }

  if(data == 'resize'){
    if(win.isMaximized()){
        win.maximize();
    } else {
        win.unmaximize();
    }
  }
}