import {IpcMainInvokeEvent} from "electron";
import path from "node:path";
import {ffmpeg, FFmpegError} from "../ffmpeg/ffmpeg-process";
import {getFFmpegConfig, getHwEncoder} from "../ffmpeg/config";
import {startRecording, FFmpegArgs} from "../ffmpeg/start-recording";
import {startStreaming, endStreaming, cancellStreaming} from "../stream/stream";
import {streamable} from "../utilities/getUserData";
import {showError} from "../electron/errors";
import store, { STORE_KEYS, USER_KEYS, user_store } from "../store";
import {
  getRecordingInputAudioDesktop,
  getRecordingInputAudioMic,
  getRecordingInputVideo,
  getRecordingPath,
  getRecordingResolution,
  isPaused,
  setPaused,
  setRecordingInputAudioDesktop,
  setRecordingInputAudioMic,
  setRecordingInputVideo,
  setRecordingPath,
  setRecordingResolution,
} from "../globals";
import deleteFolderRecursive from "../utilities/deleteFolderRecursive";
import open from "open";
import { loginUser } from "../http_client/http_client";
import { showHttpError } from "../electron/errors";

/**
 * I just cannot believe we have this function. For the love of god, why?
 */
function setGlobals(args: FFmpegArgs) {
  setRecordingInputVideo(args.video);
  setRecordingInputAudioDesktop(args.desktop);
  setRecordingInputAudioMic(args.mic);
  setRecordingResolution(args.resolution);
  setRecordingPath(args.path!);
}

/**
 * Starts recording the video and streaming it to the server.
 * @param _
 * @param video - electron's screen id
 * @param desktop - include desktop audio
 * @param mic - microphone device
 * @param resolution - output video resolution
 *
 * @returns Promise that resolves after recording process has spawned.
 *
 * @remarks If there's no way to send the video to the server, the
 * recording will be saved in a directory defined in the configuration file.
 */
export async function startRecordingHandler(
  _: IpcMainInvokeEvent,
  video: string,
  desktop: string,
  mic: string,
  resolution: string
) {
  if (ffmpeg.alive)
    return;
  const args: FFmpegArgs = {video, desktop, mic, resolution};

  if (streamable()) {
    args.hwEncode = await getHwEncoder();
    args.path = path.dirname(await startRecording(args));
    void startStreaming(args.path);
  } else {
    const config = await getFFmpegConfig();
    args.path = config.recordingPath;
    args.hwEncode = config.hwEncode;
    await startRecording(args);
  }
  setGlobals(args);
}

/**
 *  Stops recording the video and streaming.
 *  @returns Promise that resolves after recording process has terminated.
 */
export async function stopRecordingHandler() {
  if (!ffmpeg.alive)
    return;

  try {
    await ffmpeg.terminate();
  } catch (e: unknown) {
    if (e instanceof FFmpegError)
      showError(e);
    else
      throw(e);
  }
  void endStreaming().then(() => {
    const watchUrl = store.get(STORE_KEYS.VIDEO_URL) as string;
    if (watchUrl && watchUrl !== "") {
      store.set(STORE_KEYS.VIDEO_URL, "");
      void open(watchUrl);
    }
  });
}

/**
 * Stops recording the video and cancels streaming.
 */
export async function cancelRecordingHandler() {
    if (!ffmpeg.alive)
        return;
  try {
    await ffmpeg.terminate();
  } catch (e: unknown) {
        if (e instanceof FFmpegError)
            showError(e);
        else
            throw(e);
  }
  void cancellStreaming();
}

/**
 * Stops the recording and pauses streaming.
 */
export async function pauseRecordingHandler() {
    if (!ffmpeg.alive)
        return;
  setPaused(true);
  try {
    await ffmpeg.terminate();
  } catch (e: unknown) {
        if (e instanceof FFmpegError)
            showError(e);
        else
            throw(e);
  }
}

/**
 * Stops and starts recording.
 */
export async function restartRecordingHandler() {
    if (!ffmpeg.alive)
        return;
  try {
    await ffmpeg.terminate();
  } catch (e: unknown) {
        if (e instanceof FFmpegError)
            showError(e);
        else
            throw(e);
  }
  deleteFolderRecursive(getRecordingPath()!);
  const args: FFmpegArgs = {
    video: getRecordingInputVideo()!,
    mic: getRecordingInputAudioMic()!,
    desktop: getRecordingInputAudioDesktop()!,
    resolution: getRecordingResolution()!,
    path: getRecordingPath()!,
    hwEncode: await getHwEncoder(),
    }
    await startRecording(args)
}

/**
 * Resume recording and resumes streaming.
 */
export async function resumeRecordingHandler() {
    if (isPaused() || ffmpeg.alive)
        return;
  setPaused(false);
  const args: FFmpegArgs = {
    video: getRecordingInputVideo()!,
    mic: getRecordingInputAudioMic()!,
    desktop: getRecordingInputAudioDesktop()!,
    resolution: getRecordingResolution()!,
    path: getRecordingPath()!,
    hwEncode: await getHwEncoder(),
  };
  await startRecording(args);
}

/**
 * Handle the login, show error if there is any.
 */
export async function loginUserHandler(
  _: IpcMainInvokeEvent,
  email: string,
  password: string
) {
  const { loginsuccesful, error } = await loginUser(email, password);
  if (!loginsuccesful) {
    showHttpError((error as any).error);
  }
}
