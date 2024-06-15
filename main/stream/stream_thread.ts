import { Worker, parentPort, workerData } from "worker_threads";
import {
  getPresignedUrl,
  sentEndStreaming,
  getDefaultUploadParams,
  sentCancellStreaming,
  sentDeleteAllFiles,
} from "../http_client/http_client";
import store, {
  video_store,
  VIDEO_KEYS,
  VideoData,
  STORE_KEYS,
} from "../store";
import deleteFolderRecursive from "../utilities/deleteFolderRecursive";

const path = require("path");
const fs = require("fs");

let cancelled = false;

interface GlobalFileData {
  m3u8Files: string[];
  tsFiles: string[];
  [key: string]: string[];
}

interface FileLoaderMessage {
  m3u8Files: string[];
  tsFiles: string[];
  isLast: boolean;
}

interface FileSenderMessage {
  filePath: string;
  data: any;
}

interface WorkerInfo {
  worker: Worker;
  type: "ts" | "m3u8";
}

const {
  numberOfTsSenders,
  numberOfM3u8Senders,
  filePath,
  presignedUrl,
}: {
  numberOfTsSenders: number;
  numberOfM3u8Senders: number;
  filePath: string;
  presignedUrl: object | null;
} = workerData;

const my_store = video_store(path.basename(filePath));
console.log("[stream_thread]: store path: ", my_store.storePath);
const userId = store.get(STORE_KEYS.COOKIE)?.userId ?? "undefined";

my_store.setMany({
  [VIDEO_KEYS.USER_ID]: userId,
  [VIDEO_KEYS.VIDEO_LOCATION]: filePath,
});

if (presignedUrl) {
  my_store.set(VIDEO_KEYS.PRESIGNED_URL, presignedUrl);
}

let response: any = null;

let globalFileData: GlobalFileData = {
  m3u8Files: [],
  tsFiles: [],
};

const working: boolean[] = Array(numberOfM3u8Senders + numberOfTsSenders).fill(
  false
);
let isStreaming = true;
let workerExitCount = 0;

const fileLoader = new Worker(path.join(__dirname, "file_loader.bundle.js"));

fileLoader.on("message", function (e: FileLoaderMessage) {
  const { m3u8Files, tsFiles, isLast } = e;
  globalFileData.m3u8Files = globalFileData.m3u8Files.concat(m3u8Files);
  globalFileData.tsFiles = globalFileData.tsFiles.concat(tsFiles);

  console.log("m3u8Files:", m3u8Files);
  console.log("tsFiles:", tsFiles);

  if (
    globalFileData.tsFiles.length > 0 ||
    (isLast && globalFileData.m3u8Files.length > 0)
  ) {
    for (
      let i = 0;
      i < numberOfTsSenders + (isLast ? numberOfM3u8Senders : 0);
      i++
    ) {
      if (
        globalFileData[fileSenders[i].type + "Files"].length > 0 &&
        !working[i]
      ) {
        const fileName = globalFileData[fileSenders[i].type + "Files"].shift()!;
        const filePath1 = path.join(filePath, fileName);
        fileSenders[i].worker.postMessage({
          filePath: filePath1,
          data: response,
        } as FileSenderMessage);
        working[i] = true;
      }
    }
  }

  if (isLast) {
    isStreaming = false;
    for (let i = 0; i < numberOfTsSenders + numberOfM3u8Senders; i++) {
      if (!working[i]) {
        fileSenders[i].worker.terminate();
      }
    }
  }
});

const fileSenders: WorkerInfo[] = Array.from(
  { length: numberOfM3u8Senders + numberOfTsSenders },
  (_, i) => {
    const worker = new Worker(path.join(__dirname, "file_sender.bundle.js"));
    const type = i < numberOfTsSenders ? "ts" : "m3u8";

    worker.on("message", function (message: any) {
      //if error just exit immediately
      if (message.status === "error") {
        cancell(true, message.message);
      }

      console.log("message received");
      if (globalFileData[type + "Files"].length > 0) {
        const fileName = globalFileData[type + "Files"].shift()!;
        const filePath1 = path.join(filePath, fileName);
        console.log("sending next file: ", fileName);
        worker.postMessage({
          filePath: filePath1,
          data: response,
        } as FileSenderMessage);
      } else {
        console.log("no more files to send");
        working[i] = false;
        if (!isStreaming) {
          worker.terminate();
        }
      }
    });

    worker.on("exit", function () {
      console.log("worker exited");
      workerExitCount++;
    });

    return { worker, type };
  }
);

parentPort?.on("message", (message) => {
  //if cancelled we dont need to do anything
  if (cancelled) return;

  if (message.action === "start") {
    console.log("[stream_thread]: caling start()!");
    start();
  } else if (message.action === "stop") {
    console.log("[stream_thread]: calling exit()!");
    exit();
  } else if (message.action === "cancell") {
    console.log("[stream_thread]: calling cancell()!");
    cancell();
  } else if (message.action === "restart") {
    console.log("[stream_thread]: calling restart()!");
    restart();
  }
});

async function start() {
  try {
    if (my_store.get(VIDEO_KEYS.PRESIGNED_URL)) {
      console.log("[stream_thread]: presignedUrl exists!", presignedUrl);
      response = my_store.get(VIDEO_KEYS.PRESIGNED_URL);
    } else {
      //if cancell was called we can cancell imeadiately
      if (my_store.get(VIDEO_KEYS.CANCELL_CALLED)) {
        console.log("[stream_thread]: cancell called before start!");
        cancell(true);
        return;
      }

      const defaultUploadParams = await setOrGetData(
        VIDEO_KEYS.DEFAULT_UPLOAD_PARAMS,
        getDefaultUploadParams
      );

      response = await setOrGetData(VIDEO_KEYS.PRESIGNED_URL, () =>
        getPresignedUrl(defaultUploadParams)
      );
    }

    //if cancelled we dont need to start file loader
    if (my_store.get(VIDEO_KEYS.CANCELL_CALLED)) {
      console.log("[stream_thread]: cancell called before start!");
      cancell();
      return;
    }

    console.log("[stream_thread]: sending start to file loader");
    fileLoader.postMessage({
      action: "start",
      directoryPath: filePath,
    });

    if (my_store.get(VIDEO_KEYS.END_CALLED)) {
      console.log("[stream_thread]: end called before start!");
      exit();
    }
  } catch (error) {
    console.error("Error during start:", error);
  }
}

async function exit() {
  await setOrGetData(VIDEO_KEYS.END_CALLED, async () => true);

  fileLoader.postMessage({ action: "stop", directoryPath: "" });

  while (workerExitCount < numberOfM3u8Senders + numberOfTsSenders) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  fileLoader.terminate();

  while (response === null) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("[stream_thread]: sending end streaming to http client");
  await sentEndStreaming(response);

  deleteFolderRecursive(filePath);

  fs.unlinkSync(my_store.storePath);

  process.exit(0);
}

async function cancell(imidiately = false, message: string | null = null) {
  cancelled = true;

  if (!imidiately) {
    await setOrGetData(VIDEO_KEYS.CANCELL_CALLED, async () => true);
  }

  //wait file loader to terminate, so there is no events sent to file senders
  await fileLoader.terminate();

  //terminate all workers
  for (let i = 0; i < numberOfTsSenders + numberOfM3u8Senders; i++) {
    await fileSenders[i].worker.terminate();
  }

  // we can delete the folder now cos no need to keep it till the end
  if (!message) {
    deleteFolderRecursive(filePath);
  }

  //havent send Start Streaming yet due to lack of internet connection
  //just exit the process
  if (!imidiately && response) {
    console.log("[stream_thread]: sending cancell streaming to http client");
    await sentCancellStreaming(response);
  }

  //clean up
  fs.unlinkSync(my_store.storePath);

  if (message) {
    parentPort?.postMessage({ status: "error", message });
  }

  process.exit(0);
}

async function restart() {
  await sentDeleteAllFiles(response);
}

async function setOrGetData(
  key: keyof VideoData,
  defaultDataFunc: () => Promise<object | string | boolean>
) {
  console.log("[stream_thread]: setOrGetData called with key: ", key);

  let data = my_store.get(key);

  if (!data) {
    data = await defaultDataFunc();
    my_store.set(key, data);
  }

  console.log("[stream_thread]: setOrGetData returning data: ", data);

  return data;
}
