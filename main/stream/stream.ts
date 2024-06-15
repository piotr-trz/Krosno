import { Worker, workerData } from "worker_threads";
import { appLinkGetPresignedUrl } from "../app_link/handleAppLinkUrl";
import { EventEmitter } from "events";
const path = require("path");
const fs = require("fs");

let workers: Worker[] = [];
export const streamingErrorEvent = new EventEmitter();

export async function startStreaming(filePath: string) {
  console.log("creating worker");
  const worker = new Worker(path.join(__dirname, "stream_thread.bundle.js"), {
    workerData: {
      numberOfTsSenders: 4,
      numberOfM3u8Senders: 2,
      filePath: filePath,
      presignedUrl: appLinkGetPresignedUrl(),
    },
  });

  worker.on("message", (message: any) => {
    if (message.status === "error") {
      streamingErrorEvent.emit("error", message.message);
    }
  });

  worker.postMessage({ action: "start" });
  workers.push(worker);
}

export async function endStreaming() {
  const lastWorker = workers.pop();

  if (!lastWorker) {
    console.log("No worker found to end streaming");
    return;
  }

  lastWorker.postMessage({ action: "stop" });
  console.log("Waiting for main worker to exit");

  await new Promise<void>((resolve) => {
    lastWorker!.on("exit", (code: number) => {
      resolve(); // Resolve the promise when the worker exits
    });
  });

  console.log(
    "[stream.ts]: Stream thread main worker has exited successfully!"
  );
}

export async function cancellStreaming() {
  const lastWorker = workers.pop();

  if (!lastWorker) {
    console.log("No worker found to end streaming");
    return;
  }

  lastWorker.postMessage({ action: "cancell" });
  console.log(
    "[stream.ts]: Waiting for main worker to exit after calling CancellStreaming()!"
  );

  await new Promise<void>((resolve) => {
    lastWorker!.on("exit", (code: number) => {
      resolve(); // Resolve the promise when the worker exits
    });
  });

  console.log(
    "[stream.ts]: Stream thread main worker has exited successfully after cancellation!"
  );
}

export async function restoreStream(rootFolderPath: string) {
  // Read all directories in the root folder
  const directories = fs
    .readdirSync(rootFolderPath, { withFileTypes: true })
    .filter((dirent: any) => dirent.isDirectory())
    .map((dirent: any) => dirent.name);

  // For each directory, call startStreaming with the directory path
  directories.forEach((directory: string) => {
    const directoryPath = path.join(rootFolderPath, directory);
    const endCalledFilePath = path.join(directoryPath, "end_called.json");

    // Only call startStreaming if 'end_called.json' exists in the directory
    if (fs.existsSync(endCalledFilePath)) {
      console.log("[stream.ts]: Restoring stream for:", directoryPath);
      startStreaming(directoryPath);
    }
  });
}
