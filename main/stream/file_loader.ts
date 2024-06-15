import { parentPort } from "worker_threads";
const fs = require("fs");

let isWorking: boolean = true;
let m3u8Files: string[] = [];
let tsFiles: string[] = [];

async function watchDirectory(directoryPath: string) {
  try {
    let fileList: string[] = fs.readdirSync(directoryPath);

    m3u8Files = fileList.filter((file) => file.endsWith(".m3u8"));
    tsFiles = fileList.filter((file) => file.endsWith(".ts"));

    let last: boolean = true;

    while (isWorking || last) {
      if (!isWorking) last = false;
      else await new Promise((resolve) => setTimeout(resolve, 300));

      const currentFileList: string[] = fs.readdirSync(directoryPath);

      const newFiles: string[] = currentFileList.filter(
        (file) => !fileList.includes(file)
      );

      const newM3u8Files: string[] = newFiles.filter((newFile) =>
        newFile.endsWith(".m3u8")
      );

      const newTsFiles: string[] = newFiles.filter((newFile) =>
        newFile.endsWith(".ts")
      );

      m3u8Files = m3u8Files.concat(newM3u8Files);
      tsFiles = tsFiles.concat(newTsFiles);

      if (m3u8Files.length > 0 || tsFiles.length > 0 || !isWorking) {
        parentPort?.postMessage({
          m3u8Files: m3u8Files,
          tsFiles: tsFiles,
          isLast: !isWorking,
        });
        m3u8Files = [];
        tsFiles = [];
      }

      if (!isWorking) console.log("the last payload!");
      fileList = fileList.concat(currentFileList);
    }
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit();
}

parentPort?.on("message", (e) => {
  console.log("message from main process:", e);

  if (e.action === "stop") {
    console.log("stop watching directory");
    isWorking = false;
  }
  if (e.action === "start") {
    console.log("start watching directory");
    watchDirectory(e.directoryPath);
  }
});
