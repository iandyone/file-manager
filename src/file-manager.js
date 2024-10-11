import { ErrorService } from './services/errors.js';
import { PathService } from './services/paths.js';
import { FileService } from './services/files.js';
import { CompressService } from './services/compress.js';
import { HashServise } from './services/hash.js';
import { OperationSystemService } from './services/os.js';

export class FileManager {
  constructor() {
    this.username = this.getArgsDataByKey('--username') ?? 'Anonymous';

    this.handlers = {
      cd: this.cmdHandlerCd.bind(this),
      up: this.cmdHandlerUp.bind(this),
      ls: this.cmdHandlerLs.bind(this),
      rn: this.cmdHandlerRn.bind(this),
      cp: this.cmdHandlerCp.bind(this),
      rm: this.cmdHandlerRm.bind(this),
      mv: this.cmdHandlerMv.bind(this),
      os: this.cmdHandlerOs.bind(this),
      cat: this.cmdHandlerCat.bind(this),
      add: this.cmdHandlerAdd.bind(this),
      hash: this.cmdHandlerHash.bind(this),
      compress: this.cmdHandlerCompress.bind(this),
      decompress: this.cmdHandlerDecompress.bind(this),
      '.exit': this.stopFileManagerProcess.bind(this),
    };

    this.fileService = new FileService();
    this.hashService = new HashServise();
    this.pathService = new PathService();
    this.errorService = new ErrorService();
    this.compressService = new CompressService();
    this.osService = new OperationSystemService();

    this.sayHi();
    this.printCurrentDir();
  }

  getArgsDataByKey(key) {
    const data = process.argv.splice(2).find((arg) => arg.startsWith(key));

    return data ? data.replace(`${key}=`, '') : null;
  }

  sayHi() {
    process.stdout.write(`\nWelcome to the File Manager, ${this.username}!\n\n`);
  }

  sayBye() {
    process.stdout.write(`\nThank you for using File Manager, ${this.username}, goodbye!\n\n`);
  }

  printCurrentDir() {
    process.stdout.write(`You are currently in ${this.pathService.currentDir}: `);
  }

  stopFileManagerProcess() {
    this.sayBye();
    process.exit();
  }

  cmdHandlerUp() {
    this.pathService.upFromCurrentDirectory();
  }

  getBaseAndNewFilesPaths(baseFileDir, newFileDir) {
    const filePath = this.pathService.getFilePathFromHomeDir(baseFileDir);
    const baseFileData = this.pathService.parse(filePath);

    if (!newFileDir) {
      return { filePath, baseFileData };
    }

    const baseFilePath = this.pathService.getFileLocation(filePath);
    const newFilePath = this.pathService.join(baseFilePath, newFileDir);

    return { filePath, baseFileData, baseFilePath, newFilePath };
  }

  cmdHandlerOs(arg) {
    const systemData = this.osService.getOperationSystemInfo(arg);

    if (systemData) {
      process.stdout.write(`\n${systemData}\n\n`);
    }
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

  async cmdHandlerCd(pathToDirectory) {
    return await this.pathService.changeDirectory(pathToDirectory);
  }

  async cmdHandlerLs() {
    await this.pathService.ls();
  }

  async cmdHandlerCat(pathToFile) {
    const filePath = await this.pathService.getFilePathFromHomeDir(pathToFile);

    await this.fileService.readByStream(filePath);
  }

  async cmdHandlerAdd(newFileName) {
    const filePath = await this.pathService.getFilePathFromHomeDir(newFileName);

    await this.fileService.addFile(filePath);
  }

  async cmdHandlerRn(pathToFile, newFileName) {
    const { filePath, newFilePath } = this.getBaseAndNewFilesPaths(pathToFile, newFileName);

    return await this.fileService.renameFile(filePath, newFilePath);
  }

  async cmdHandlerCp(pathToFile, pathToNewDir) {
    const { filePath, baseFileData } = this.getBaseAndNewFilesPaths(pathToFile);
    const { filePath: newPath } = this.getBaseAndNewFilesPaths(pathToNewDir);

    const isValidBasePath = await this.pathService.isFile(filePath);
    const isValidNewPath = await this.pathService.isDirectory(newPath);

    if (isValidBasePath && isValidNewPath) {
      return await this.fileService.copyFile(filePath, pathToNewDir, baseFileData.base);
    }
  }

  async cmdHandlerRm(pathToFile) {
    const { filePath } = this.getBaseAndNewFilesPaths(pathToFile);

    return await this.fileService.removeFile(filePath);
  }

  async cmdHandlerMv(pathToFile, pathToNewDir) {
    const { filePath, baseFileData } = this.getBaseAndNewFilesPaths(pathToFile);
    const { filePath: destinationPath } = this.getBaseAndNewFilesPaths(pathToNewDir);

    return await this.fileService.moveFile(filePath, destinationPath, baseFileData.base);
  }

  async cmdHandlerHash(pathToFile) {
    const { filePath } = this.getBaseAndNewFilesPaths(pathToFile);
    const fileData = await this.fileService.readFile(filePath);
    const hash = this.hashService.hash(fileData);

    process.stdout.write(`\n${hash}\n\n`);
  }

  async cmdHandlerCompress(pathToFile, pathToDestination = './') {
    const { filePath, baseFileData } = this.getBaseAndNewFilesPaths(pathToFile, pathToDestination);

    const destinationPath = this.pathService.join(pathToDestination.trim(), `${baseFileData.base}.br`);

    const compressedFilePath = this.pathService.getFilePathFromHomeDir(destinationPath);

    return await this.compressService.compressFile(filePath, compressedFilePath);
  }

  async cmdHandlerDecompress(pathToFile, pathToDestination = './') {
    const { name: fileName } = this.pathService.parse(pathToFile);
    const pathToDestinationWithFileName = this.pathService.join(pathToDestination.trim(), fileName);

    const { filePath: compressedFilePath } = this.getBaseAndNewFilesPaths(pathToFile, pathToDestinationWithFileName);

    const decompressedFilePath = this.pathService.getFilePathFromHomeDir(pathToDestinationWithFileName);

    return await this.compressService.decompressFile(compressedFilePath, decompressedFilePath);
  }
}
