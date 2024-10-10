import { ErrorService } from './services/errors.js';
import { DirService } from './services/directory.js';
import { FileService } from './services/files.js';
export class FileManager {
  constructor() {
    this.username = this.getArgsDataByKey('--username');

    this.commands = {
      ['.exit']: this.stopFileManagerProcess.bind(this),
      up: this.cmdHandlerUp.bind(this),
      cd: this.cmdHandlerCd.bind(this),
      ls: this.cmdHandlerLs.bind(this),
      cat: this.cmdHandlerCat.bind(this),
      add: this.cmdHandlerAdd.bind(this),
      rn: this.cmdHandlerRn.bind(this),
      cp: this.cmdHandlerCp.bind(this),
      rm: this.cmdHandlerRm.bind(this),
      mv: this.cmdHandlerMv.bind(this),
    };

    // this.dirService = new DirService(process.env.HOME);
    this.dirService = new DirService(`${process.env.HOME}/Projects/RSS/file-manager`);
    this.errorService = new ErrorService();
    this.fileService = new FileService();

    this.sayHi();
    this.printCurrentDir();
  }

  async cmd(cmd, ...args) {
    const commandHandler = this.commands[cmd];

    if (commandHandler) {
      try {
        await commandHandler(...args);
      } catch (error) {
        // this.errorService.sendOperationFailedErrorMessage();
        console.log(error);
      }
    } else {
      this.errorService.sendInvalidInputErrorMessage();
    }
  }

  getArgsDataByKey(key) {
    const data = process.argv.splice(2).find((arg) => arg.startsWith(key));

    return data ? data.replace(`${key}=`, '') : 'Anonymous';
  }

  sayHi() {
    process.stdout.write(`\nWelcome to the File Manager, ${this.username}!\n\n`);
  }

  sayBye() {
    process.stdout.write(`\nThank you for using File Manager, ${this.username}, goodbye!\n\n`);
  }

  printCurrentDir() {
    process.stdout.write(`You are currently in ${this.dirService.currentDir}: `);
  }

  stopFileManagerProcess() {
    this.sayBye();
    process.exit();
  }

  cmdHandlerUp() {
    this.dirService.upFromCurrentDirectory();
  }

  getBaseAndNewFilesPaths(baseFileDir, newFileDir) {
    const filePath = this.dirService.getFilePathFromHomeDir(baseFileDir);

    const baseFileData = this.dirService.parseFilePath(filePath);

    if (!newFileDir) {
      return { filePath, baseFileData };
    }

    const baseFilePath = this.dirService.getFileLocation(filePath);
    const newFilePath = this.dirService.join(baseFilePath, newFileDir);

    return { filePath, baseFileData, baseFilePath, newFilePath };
  }

  async cmdHandlerCd(directory) {
    await this.dirService.changeDirectory(directory);
  }

  async cmdHandlerLs() {
    await this.dirService.ls();
  }

  async cmdHandlerCat(path) {
    const filePath = await this.dirService.getFilePathFromHomeDir(path);

    await this.fileService.readFile(filePath);
  }

  async cmdHandlerAdd(fileName) {
    const filePath = await this.dirService.getFilePathFromHomeDir(fileName);

    await this.fileService.addFile(filePath);
  }

  async cmdHandlerRn(fileDir, newFileName) {
    const { filePath, newFilePath } = this.getBaseAndNewFilesPaths(fileDir, newFileName);

    return await this.fileService.renameFile(filePath, newFilePath);
  }

  async cmdHandlerCp(fileDir, newFileDir) {
    const { filePath, baseFileData } = this.getBaseAndNewFilesPaths(fileDir);

    return await this.fileService.copyFile(filePath, newFileDir, baseFileData.base);
  }

  async cmdHandlerRm(fileDir) {
    const { filePath } = this.getBaseAndNewFilesPaths(fileDir);

    return await this.fileService.removeFile(filePath);
  }

  async cmdHandlerMv(fileDir, newFileDir) {
    const { filePath, baseFileData } = this.getBaseAndNewFilesPaths(fileDir);
    const { filePath: newFilePath } = this.getBaseAndNewFilesPaths(newFileDir);

    return await this.fileService.moveFile(filePath, newFilePath, baseFileData.base);
  }
}
