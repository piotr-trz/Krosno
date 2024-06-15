import {ffmpeg, FFmpegError} from "../ffmpeg/ffmpeg-process";
import {getRecordingPath} from "../globals";
import deleteFolderRecursive from "../utilities/deleteFolderRecursive";
import {showError, showHttpError} from "../electron/errors";

async function streamingErrorEventHandler(event: any) {
  return new Promise<void>(async (resolve, reject) => {
    if (!ffmpeg.alive) {
      return;
    }
    try {
      await ffmpeg.terminate();
    } catch (e: unknown) {
      if (e instanceof FFmpegError) showError(e);
      else throw e;
    }
    deleteFolderRecursive(getRecordingPath()!);
    resolve();
    showHttpError(event.message);
  });
}

export default streamingErrorEventHandler;
