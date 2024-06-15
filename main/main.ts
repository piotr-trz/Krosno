import {app, screen, BrowserWindow, ipcMain} from 'electron';
import path from "node:path";
import {getDefaultRecPath, setDefaultRecPath, setHwEncoder, getHwEncoder} from "./ffmpeg/config";
import {listDevices} from "./ffmpeg/list-devices";
import {isRecording} from "./ffmpeg/ffmpeg-process";
import {startCamera} from "./electron/camera";
import {closeWindow, minimizeWindow} from "./electron/window-handling";
import {startRecordingHandler, stopRecordingHandler, cancelRecordingHandler, loginUserHandler} from "./ipc_handlers/ipc-handlers";
import {logoutUser} from "./http_client/http_client";
import handleAppLinkUrl, {appLinkHasPresignedUrl} from "./app_link/handleAppLinkUrl";
import getUserData from "./utilities/getUserData";
import { streamingErrorEvent } from "./stream/stream";
import streamingErrorEventHandler from "./event_handlers/streamingErrorEventHandler";

let mainWindow: BrowserWindow | null = null;

const createWindow = async () => {
  let display = screen.getPrimaryDisplay();
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    x: display.bounds.width - 430,
    y: 20,
    webPreferences: {
      preload: path.join(__dirname, "preload.bundle.js"),
    },
    frame: false,
    resizable: false,
    maximizable: false,
    alwaysOnTop: true,
  });

  if (app.isPackaged)
    await mainWindow.loadFile('dist/index.html');
  else
    await mainWindow.loadURL("http://localhost:8080");
};

// Register app to krosno-desktop protocol
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("krosno-desktop", process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("krosno-desktop");
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  // Behaviour on app-link click when app is already open.
  app.on("second-instance", (_, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }

    if (commandLine.length > 2) {
      const url = commandLine[commandLine.length - 1];
      handleAppLinkUrl(url);
    }
  });

  app.on("open-url", (event, url) => {
    event.preventDefault();
    handleAppLinkUrl(url);
  });

  app.whenReady().then(async () => {
    if (process.argv.length > 2 && !app.isPackaged) {
      const url = process.argv[process.argv.length - 1];
      handleAppLinkUrl(url);
    } else if (process.argv.length > 1 && app.isPackaged) {
      const url = process.argv[process.argv.length - 1];
      handleAppLinkUrl(url);
    }

    ipcMain.on("electron:closeApp", app.quit);
    ipcMain.on("electron:minimizeWindow", minimizeWindow);
    ipcMain.on("electron:closeWindow", closeWindow);
    ipcMain.on("electron:startCamera", startCamera);
    ipcMain.handle("ffmpeg:listDevices", listDevices);
    ipcMain.handle("ffmpeg:isRecording", isRecording);
    ipcMain.handle("ffmpeg:getDefaultRecPath", getDefaultRecPath);
    ipcMain.handle("ffmpeg:setDefaultRecPath", setDefaultRecPath);
    ipcMain.handle("ffmpeg:setHwEncoder", setHwEncoder);
    ipcMain.handle("ffmpeg:getHwEncoder", getHwEncoder);
    ipcMain.handle("ipc_handlers:startRecordingHandler", startRecordingHandler);
    ipcMain.handle("ipc_handlers:stopRecordingHandler", stopRecordingHandler);
    ipcMain.handle("ipc_handlers:cancelRecordingHandler", cancelRecordingHandler);
    ipcMain.handle("ipc_handlers:loginUserHandler", loginUserHandler);
    ipcMain.handle("ipc_handlers:logoutUserHandler", logoutUser);
    ipcMain.handle("utilities:getUserData", getUserData);
    ipcMain.handle("app_link:appLinkHasPresignedUrl", appLinkHasPresignedUrl);
    streamingErrorEvent.on("error", streamingErrorEventHandler);
    await createWindow();
  });
}
