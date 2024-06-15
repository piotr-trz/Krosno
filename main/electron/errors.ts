import {FFmpegError} from "../ffmpeg/ffmpeg-process";
import {dialog} from "electron";

/**
 * Show electron error.
 * @param e - Subclass of Error used for function overloading
 */
export function showError(e: FFmpegError) {
  dialog.showErrorBox(
    "FFmpegError",
    e.message + " Please run it once more in offline mode and check logs."
  );
}

export function showHttpError(e: string) {
  dialog.showErrorBox("HTTP Error", e);
}
