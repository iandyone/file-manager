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

    this.dirService = new DirService(process.env.HOME);
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
        this.errorService.sendOperationFailedErrorMessage();
        // console.log(error);
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
    this.dirService.up();
  }

  getFilesPaths(sourceFileDir, newFileDir) {
    const filePath = this.dirService.getFileDir(sourceFileDir);
    const filename = this.dirService.getFileName(filePath);

    if (!newFileDir) {
      return { filePath, filename };
    }

    const workDir = this.dirService.getWorkDir(filePath);
    const newFilePath = this.dirService.getPath(workDir, newFileDir);

    return { filePath, filename, newFilePath, workDir };
  }

  async cmdHandlerCd(directory) {
    await this.dirService.cd(directory);
  }

  async cmdHandlerLs() {
    await this.dirService.ls();
  }

  async cmdHandlerCat(path) {
    const filePath = await this.dirService.getFileDir(path);

    await this.fileService.readFile(filePath);
  }

  async cmdHandlerAdd(fileName) {
    const filePath = await this.dirService.getFileDir(fileName);

    await this.fileService.addFile(filePath);
  }

  async cmdHandlerRn(fileDir, newFileName) {
    const { filePath, newFilePath } = this.getFilesPaths(fileDir, newFileName);

    return await this.fileService.renameFile(filePath, newFilePath);
  }

  async cmdHandlerCp(fileDir, newFileDir) {
    const { filePath, filename } = this.getFilesPaths(fileDir);

    return await this.fileService.copyFile(filePath, newFileDir, filename);
  }

  async cmdHandlerRm(fileDir) {
    const { filePath } = this.getFilesPaths(fileDir);

    return await this.fileService.removeFile(filePath);
  }

  async cmdHandlerMv(fileDir, newFileDir) {
    const { filePath, filename } = this.getFilesPaths(fileDir);
    const { filePath: newFilePath } = this.getFilesPaths(newFileDir);

    return await this.fileService.moveFile(filePath, newFilePath, filename);
  }
}
