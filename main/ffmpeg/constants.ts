import path from "node:path";
import {tmpdir} from "node:os";
import {app} from "electron";

const APP_NAME = "krosno-desktop";

/**
 * Directory of video chunks that will be sent to the server.
 */
export const TEMP_PATH = path.join(tmpdir(), APP_NAME);

/**
 * Recording's .m3u8 filename.
 */
export const PLAYLIST_NAME = "playlist.m3u8";

/**
 * Recording's log filename.
 */
export const LOGFILE_NAME = "logs.txt"

/**
 * Path to ffmpeg binary.
 */
export const FFMPEG_BIN = app.isPackaged && process.platform === 'win32' ?
    path.join(process.resourcesPath, "ffmpeg.exe") : "ffmpeg";