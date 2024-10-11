import fs from 'fs';
import path from 'path';
import stream from 'stream/promises';
import { ErrorService } from './errors.js';

export class FileService {
  constructor() {
    this.errorService = new ErrorService();
  }

  async readByStream(filePath) {
    process.stdin.pause();

    return new Promise((resolve) => {
      const readableStream = fs.createReadStream(filePath, { encoding: 'utf8' });

      readableStream.on('data', (chunk) => {
        process.stdout.write(chunk);
      });

      readableStream.on('end', () => {
        process.stdout.write('\n');
        process.stdin.resume();
        resolve();
      });

      readableStream.on('error', () => {
        this.errorService.sendOperationFailedErrorMessage();
        resolve();
      });
    });
  }

  async readFile(filePath) {
    return await fs.promises.readFile(filePath, { encoding: 'utf-8' });
  }

  async addFile(filePath) {
    await fs.promises.writeFile(filePath, '', { flag: 'wx' });
  }

  async renameFile(filePath, fileName) {
    await fs.promises.rename(filePath, fileName);
  }

  async copyFile(filePath, pathTo, fileName) {
    const readableStream = fs.createReadStream(path.resolve(filePath));
    const writableStream = fs.createWriteStream(path.resolve(pathTo, fileName));

    await stream.pipeline(readableStream, writableStream);
  }

  async removeFile(filePath) {
    await fs.promises.rm(filePath);
  }

  async moveFile(filePath, pathTo, fileName) {
    await this.copyFile(filePath, pathTo, fileName);
    await this.removeFile(filePath);
  }
}
