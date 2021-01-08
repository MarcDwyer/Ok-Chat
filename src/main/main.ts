import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as url from "url";
import { getTwitchUrl } from "./util";

import { deferred, Deferred } from "./util";

let win: BrowserWindow | null;

// const installExtensions = async () => {
//     const installer = require('electron-devtools-installer');
//     const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
//     const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

//     return Promise.all(
//         extensions.map(name => installer.default(installer[name], forceDownload))
//     ).catch(console.log); // eslint-disable-line no-console
// };
const title = "Ok-Chat";
const createWindow = async () => {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
    title,
  });
  if (process.env.NODE_ENV !== "production" && win) {
    // win.webContents.session.clearStorageData();
  }
  win.on("page-title-updated", function(e) {
    e.preventDefault();
  });

  win.setTitle(title);

  if (process.env.NODE_ENV !== "production") {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "1"; // eslint-disable-line require-atomic-updates
    win.loadURL(`http://localhost:2003`);
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true,
      })
    );
  }

  if (process.env.NODE_ENV !== "production") {
    // Open DevTools, see https://github.com/electron/electron/issues/12438 for why we wait for dom-ready
    win.webContents.once("dom-ready", () => {
      win!.webContents.openDevTools();
    });
  }

  win.on("closed", () => {
    win = null;
  });
};

app.on("ready", () => {
  createWindow();
});

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
const clientID = "d30da4qze1heg6lr149qu7et2t4aof";
const redirect = "https://localhost/";

function handleAuthApp(url: string, signal: Deferred<string>) {
  url = url.replace("#", "?");
  const u = new URL(url);
  const accessToken = u.searchParams.get("access_token");
  if (accessToken) signal.resolve(accessToken);
}
ipcMain.on("get-auth", async (event, arg: any) => {
  const signal = deferred<string>();
  let authWindow: BrowserWindow | null = new BrowserWindow({
    width: 600,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: true,
    },
    alwaysOnTop: true,
  });
  const url = getTwitchUrl(clientID, redirect);
  authWindow.loadURL(url);
  authWindow.show();

  authWindow.on("close", () => {
    authWindow = null;
  });
  authWindow.webContents.on("will-redirect", function(event, newUrl) {
    console.log(`Redirect: ${newUrl}`);
    handleAuthApp(newUrl, signal);
  });
  authWindow.webContents.on("will-navigate", function(event, newUrl) {
    console.log(`Navigate: ${newUrl}`);
    handleAuthApp(newUrl, signal);
  });
  try {
    const accessToken = await signal;
    authWindow.close();
    authWindow = null;
    event.reply("token", { token: accessToken });
  } catch (e) {
    event.reply("error", e);
  }
});
