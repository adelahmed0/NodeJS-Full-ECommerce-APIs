/**
 * @description this class is responsible about operation errors (errors that I can predict)
 */
export class ApiError extends Error {
  public statusCode: number;
  public status: boolean;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = false;
    this.isOperational = true;
  }
}
