import {app, screen, BrowserWindow} from "electron";
import path from "node:path";

/**
 * Start always-on-top camera.
 *
 * @remarks
 * The camera is under the URL pathname, /#/camera.
 */
export async function startCamera() {
    const display = screen.getPrimaryDisplay();
    const win = new BrowserWindow({
        width: 375,
        height: 375,
        x: display.bounds.width - 395,
        y: display.bounds.height - 385,
        frame: false,
        resizable: false,
        maximizable: false,
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.bundle.js')
        },
    })

    if (app.isPackaged)
        await win.loadFile('dist/index.html', { hash: 'camera' });
    else
        await win.loadURL("http://localhost:8080/#/camera");
}