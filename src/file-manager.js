import { ErrorService } from './services/errors.js';
import { DirService } from './services/directories.js';
import { FileService } from './services/files.js';
import { CompressService } from './services/compress.js';
import { HashServise } from './services/hash.js';
import { OperationSystemService } from './services/os.js';

export class FileManager {
  constructor() {
    this.username = this.getArgsDataByKey('--username');

    this.handlers = {
      '.exit': this.stopFileManagerProcess.bind(this),
      up: this.cmdHandlerUp.bind(this),
      cd: this.cmdHandlerCd.bind(this),
      ls: this.cmdHandlerLs.bind(this),
      cat: this.cmdHandlerCat.bind(this),
      add: this.cmdHandlerAdd.bind(this),
      rn: this.cmdHandlerRn.bind(this),
      cp: this.cmdHandlerCp.bind(this),
      rm: this.cmdHandlerRm.bind(this),
      mv: this.cmdHandlerMv.bind(this),
      compress: this.cmdHandlerCompress.bind(this),
      decompress: this.cmdHandlerDecompress.bind(this),
      hash: this.cmdHandlerHash.bind(this),
      os: this.cmdHandlerOs.bind(this),
    };

    this.dirService = new DirService(process.env.HOME);
    this.errorService = new ErrorService();
    this.fileService = new FileService();
    this.compressService = new CompressService();
    this.hashService = new HashServise();
    this.osService = new OperationSystemService();

    this.sayHi();
    this.printCurrentDir();
  }

  async cmd(cmd, ...args) {
    const commandHandler = this.handlers[cmd];

    if (commandHandler) {
      try {
        await commandHandler(...args);
      } catch (error) {
        this.errorService.sendOperationFailedErrorMessage();
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
    const baseFileData = this.dirService.parse(filePath);

    if (!newFileDir) {
      return { filePath, baseFileData };
    }

    const baseFilePath = this.dirService.getFileLocation(filePath);
    const newFilePath = this.dirService.join(baseFilePath, newFileDir);

    return { filePath, baseFileData, baseFilePath, newFilePath };
  }

  cmdHandlerOs(arg) {
    const systemData = this.osService.getOperationSystemInfo(arg);

    if (systemData) {
      process.stdout.write(`\n${systemData}\n\n`);
    }
  }

  async cmdHandlerHash(pathToFile) {
    const { filePath } = this.getBaseAndNewFilesPaths(pathToFile);
    const fileData = await this.fileService.readFile(filePath);
    const hash = this.hashService.hash(fileData);

    process.stdout.write(hash);
    process.stdout.write('\n');
  }

  async cmdHandlerCd(directory) {
    await this.dirService.changeDirectory(directory);
  }

  async cmdHandlerLs() {
    await this.dirService.ls();
  }

  async cmdHandlerCat(path) {
    const filePath = await this.dirService.getFilePathFromHomeDir(path);

    await this.fileService.readByStream(filePath);
  }

  async cmdHandlerAdd(fileName) {
    const filePath = await this.dirService.getFilePathFromHomeDir(fileName);

    await this.fileService.addFile(filePath);
  }

  async cmdHandlerRn(pathToFile, newFileName) {
    const { filePath, newFilePath } = this.getBaseAndNewFilesPaths(pathToFile, newFileName);

    return await this.fileService.renameFile(filePath, newFilePath);
  }

  async cmdHandlerCp(pathToFile, pathToNewDir) {
    const { filePath, baseFileData } = this.getBaseAndNewFilesPaths(pathToFile);

    return await this.fileService.copyFile(filePath, pathToNewDir, baseFileData.base);
  }

  async cmdHandlerRm(fileDir) {
    const { filePath } = this.getBaseAndNewFilesPaths(fileDir);

    return await this.fileService.removeFile(filePath);
  }

  async cmdHandlerMv(fileDir, newFileDir = './') {
    const { filePath, baseFileData } = this.getBaseAndNewFilesPaths(fileDir);
    const { filePath: destinationPath } = this.getBaseAndNewFilesPaths(newFileDir);

    return await this.fileService.moveFile(filePath, destinationPath, baseFileData.base);
  }

  async cmdHandlerCompress(fileDir, compressedFileDir = './') {
    const { filePath, baseFileData } = this.getBaseAndNewFilesPaths(fileDir, compressedFileDir);

    const compressedFilePath = this.dirService.join(compressedFileDir.trim(), `${baseFileData.name}.gz`);

    const destinationPath = this.dirService.getFilePathFromHomeDir(compressedFilePath);

    return await this.compressService.compressFile(filePath, destinationPath);
  }

  async cmdHandlerDecompress(fileDir, compressedFileDir) {
    const { filePath } = this.getBaseAndNewFilesPaths(fileDir, compressedFileDir);
    const destinationPath = this.dirService.getFilePathFromHomeDir(compressedFileDir);

    return await this.compressService.decompressFile(filePath, destinationPath);
  }
}
