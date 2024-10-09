import path from 'path';
import fs from 'fs/promises';
import { ErrorService } from './errors.js';

export class DirService {
  constructor(homeDir) {
    this.homeDir = homeDir;
    this.currentDir = homeDir;

    this.errorService = new ErrorService();
  }

  up() {
    if (this.currentDir === this.homeDir) {
      return;
    }

    this.currentDir = path.resolve(this.currentDir, '../');
  }

  async cd(directory = '') {
    try {
      const newDir = path.join(this.currentDir, directory).trim();

      const stat = await fs.stat(newDir);

      if (await stat.isDirectory()) {
        this.currentDir = newDir;
      }
    } catch (error) {
      this.errorService.sendInvalidInputErrorMessage();
    }
  }

  async ls() {
    try {
      const dirData = await fs.readdir(this.currentDir);
      const tableData = [];

      for (const fileName of dirData.values()) {
        const filePath = path.join(this.currentDir, fileName);
        const fileStat = await fs.stat(filePath);

        tableData.push({
          Name: fileName,
          Type: fileStat.isDirectory() ? 'directory' : 'file',
        });
      }

      tableData.sort((a, b) => {
        if (a.Type === b.Type) {
          return a.Name.localeCompare(b.Name);
        }

        return a.Type === 'directory' ? -1 : 1;
      });

      console.table(tableData);
    } catch (err) {
      console.error(`Error reading directory: ${err.message}`);
    }
  }
}
