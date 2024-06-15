const path = require("path");
const fs = require("fs");

function deleteFolderRecursive(directoryPath: string) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file: string, index: number) => {
      const curPath = path.join(directoryPath, file);

      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });

    fs.rmdirSync(directoryPath);
  }
}

export default deleteFolderRecursive;
