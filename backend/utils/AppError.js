/**
 * Custom application error class.
 * Operational errors thrown via AppError are caught by the centralized
 * error middleware and returned to the client with the correct status code.
 *
 * @param {string} message  — Human-readable error message
 * @param {number} statusCode — HTTP status code (default 500)
 * @param {string} errorCode  — Machine-readable error code (e.g. "PRODUCT_NOT_FOUND")
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
