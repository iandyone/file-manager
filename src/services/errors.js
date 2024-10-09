export class ErrorService extends Error {
  constructor() {
    super();
  }

  sendInvalidInputErrorMessage() {
    process.stdout.write('Invalid input\n');
  }

  sendOperationFailedErrorMessage() {
    process.stdout.write('Operation failed\n');
  }
}
