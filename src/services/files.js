import fs from 'fs';
import path from 'path';
import stream from 'stream/promises';

export class FileService {
  async readFile(filePath) {
    const readableStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    await readableStream.pipe(process.stdout);
  }

  async addFile(filePath) {
    await fs.promises.writeFile(filePath, '', { flag: 'wx' });
  }

  async renameFile(filePath, fileName) {
    await fs.promises.rename(filePath.trim(), fileName.trim());
  }

  async copyFile(filePath, pathTo, fileName) {
    const readableStream = fs.createReadStream(path.resolve(filePath).trim());

    const writableStream = fs.createWriteStream(path.resolve(pathTo.trim(), fileName).trim());

    await stream.pipeline(readableStream, writableStream);
  }

  async removeFile(filePath) {
    await fs.promises.rm(filePath);
  }

  async moveFile(filePath, pathTo, fileName) {
    await this.copyFile(filePath, pathTo, fileName);
    await this.removeFile(filePath);
  }

  async checkIsFileExitts(filePath) {
    return await fs.promises.stat(filePath);
  }
}
