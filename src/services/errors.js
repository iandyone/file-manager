export class ErrorService {
  sendInvalidInputErrorMessage() {
    process.stdout.write('Invalid input\n');
  }

  sendOperationFailedErrorMessage() {
    process.stdout.write('Operation failed\n');
  }
}
