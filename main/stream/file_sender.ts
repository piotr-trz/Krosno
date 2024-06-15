import { sendFileContentToPresignedUrl } from "../http_client/http_client";
import { parentPort } from "worker_threads";

const path = require("path");
const fs = require("fs");

async function sendFileToPresignedUrl(filePath: string, data: any) {
  const fileContent = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  console.log("sending file: ", [fileName]);

  try {
    await sendFileContentToPresignedUrl(fileName, data, fileContent);
  } catch (e: any) {
    parentPort?.postMessage({ status: "error", message: e.message });
    return;
  }

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  parentPort?.postMessage({
    status: "success",
    message: "file sent successfully",
  });
}

parentPort?.on("message", (e: { filePath: string; data: any }) => {
  console.log(e);
  sendFileToPresignedUrl(e.filePath, e.data);
});
