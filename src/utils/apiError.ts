/**
 * @description Custom error class for operational (predictable) errors.
 * Extends the native Error class to include statusCode and status properties.
 */
export class ApiError extends Error {
  // HTTP Response status code
  public statusCode: number;
  // Always false for error objects
  public status: boolean;
  // Marker to differentiate between operational and programming errors
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = false;
    this.isOperational = true;
  }
}
