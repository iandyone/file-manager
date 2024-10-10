import { ErrorService } from './errors.js';
import os from 'os';

export class OperationSystemService {
  constructor() {
    this.errorService = new ErrorService();

    this.handlers = {
      '--EOL': this.getEOL,
      '--cpus': this.getCPUs,
      '--homedir': this.getHomeDir,
      '--username': this.getUserName,
      '--architecture': this.getArch,
    };
  }

  getOperationSystemInfo(arg) {
    const commandHandler = this.handlers[arg.trim()];

    if (commandHandler) {
      return commandHandler();
    }

    this.errorService.sendInvalidInputErrorMessage();
  }

  getEOL() {
    return JSON.stringify(os.EOL);
  }

  getCPUs() {
    const cpusData = os.cpus().map(({ model, speed }) => ({
      model,
      speed: `${speed / 1000}GHz`,
    }));

    return JSON.stringify({ amount: cpusData.length, cpusData });
  }

  getHomeDir() {
    return os.homedir();
  }

  getUserName() {
    return os.userInfo().username;
  }

  getArch() {
    return os.arch();
  }
}
