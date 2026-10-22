const { StatusCodes, getReasonPhrase } = require("http-status-codes");

/**
 * Map HTTP status code to canonical string error code
 * @param {number} statusCode
 * @returns {string}
 */
const getCanonicalErrorCode = (statusCode) => {
  switch (statusCode) {
    case StatusCodes.BAD_REQUEST:
      return "BAD_REQUEST";
    case StatusCodes.UNAUTHORIZED:
      return "UNAUTHORIZED";
    case StatusCodes.FORBIDDEN:
      return "FORBIDDEN";
    case StatusCodes.NOT_FOUND:
      return "NOT_FOUND";
    case StatusCodes.CONFLICT:
      return "CONFLICT";
    case StatusCodes.TOO_MANY_REQUESTS:
      return "RATE_LIMIT_EXCEEDED";
    case StatusCodes.SERVICE_UNAVAILABLE:
      return "SERVICE_UNAVAILABLE";
    default:
      return "INTERNAL_SERVER_ERROR";
  }
};

const errorHandlerMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message =
    err.message ||
    (statusCode === StatusCodes.INTERNAL_SERVER_ERROR
      ? "An unexpected error occurred. Please try again later."
      : getReasonPhrase(statusCode));

  const errorCode = err.code || getCanonicalErrorCode(statusCode);

  // Log 500 server errors for server-side observability
  if (statusCode >= 500) {
    console.error(`[Server Error] [${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`, err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    msg: message, // Backward compatibility for legacy clients
    error: {
      code: errorCode,
      details: err.details || null,
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorHandlerMiddleware;
