import { FileManager } from './src/file-manager.js';

const fileManager = new FileManager();

process.stdin.on('data', async (cmd) => {
  process.stdin.pause();

  const [command, ...args] = cmd.toString().split(' ');

  await fileManager.cmd(command.trim(), ...args);

  fileManager.printCurrentDir();
  process.stdin.resume();
});

process.on('SIGINT', () => {
  fileManager.stopFileManagerProcess();
});
