import {BrowserWindow} from "electron";

/**
 * Minimize focused window.
 */
export async function minimizeWindow() {
    const win = BrowserWindow.getFocusedWindow();
    if (win)
        win.minimize();
}

/**
 * Close focused window.
 */
export async function closeWindow() {
    const win = BrowserWindow.getFocusedWindow();
    if (win)
        win.close();
}
