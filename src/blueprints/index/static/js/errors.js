export class CommandError extends Error {
  constructor(msg, statusCode) {
    super(msg);
    this.statusCode = statusCode;
    this.name = CommandError.name;
  }
}