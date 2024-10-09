import path from 'path';
import { ErrorService } from './services/errors.js';
import { DirService } from './services/directory.js';

export class FileManager {
  constructor() {
    this.username = this.getArgsDataByKey('--username');

    this.commands = {
      ['.exit']: this.stopFileManagerProcess.bind(this),
      up: this.cmdHandlerUp.bind(this),
      cd: this.cmdHandlerCd.bind(this),
      ls: this.cmdHandlerLs.bind(this),
    };

    this.dirService = new DirService(process.env.HOME);
    this.errorService = new ErrorService();

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

  async cmdHandlerCd(directory) {
    await this.dirService.cd(directory);
  }

  async cmdHandlerLs() {
    await this.dirService.ls();
  }
}
