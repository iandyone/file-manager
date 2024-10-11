import path from 'path';
import fs from 'fs/promises';
import { ErrorService } from './errors.js';

export class PathService {
  constructor() {
    this.homeDir = process.env.HOME;
    this.currentDir = process.cwd();

    this.errorService = new ErrorService();
  }

  getFilePathFromHomeDir(filePath) {
    return filePath.startsWith(this.homeDir) ? filePath : path.join(this.currentDir, filePath);
  }

  getFileLocation(filePath) {
    return path.join(filePath, '../');
  }

  join(root, ...args) {
    return path.join(root, ...args);
  }

  parse(filePath) {
    const fileData = path.parse(filePath);

    return fileData;
  }

  upFromCurrentDirectory() {
    if (this.currentDir === this.homeDir) {
      return;
    }

    this.currentDir = path.resolve(this.currentDir, '../');
  }

  async isDirectory(directory) {
    const fileStat = await fs.stat(directory);

    return fileStat.isDirectory();
  }

  async isFile(directory) {
    const fileStat = await fs.stat(directory);

    return fileStat.isFile();
  }

  async assessPath(path) {
    try {
      return await fs.access(path);
    } catch (error) {
      this.errorService.sendInvalidInputErrorMessage();
    }
  }

  async changeDirectory(directory = '') {
    try {
      if (directory.startsWith(this.homeDir)) {
        this.currentDir = directory;
        return;
      }

      const newDir = path.join(this.currentDir, directory);
      await fs.access(newDir);
      const isFolder = await this.isDirectory(newDir);

      if (isFolder) {
        this.currentDir = newDir;
        return;
      }

      this.errorService.sendInvalidInputErrorMessage();
    } catch (error) {
      this.errorService.sendInvalidInputErrorMessage();
    }
  }

  async getFilesListFromCurrentDir() {
    try {
      const dirData = await fs.readdir(this.currentDir);

      const tableData = await Promise.all(
        dirData.map(async (fileName) => {
          const filePath = path.join(this.currentDir, fileName);
          const fileStat = await fs.stat(filePath);

          return {
            Name: fileName,
            Type: fileStat.isDirectory() ? 'directory' : 'file',
          };
        })
      );

      tableData.sort((a, b) => {
        if (a.Type === b.Type) {
          return a.Name.localeCompare(b.Name);
        }

        return a.Type === 'directory' ? -1 : 1;
      });

      return tableData;
    } catch (err) {
      console.error(`Error reading directory: ${err.message}`);
    }
  }
}
