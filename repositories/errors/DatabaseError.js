const CustomError = require("../../errors/custom-error");
const { StatusCodes } = require("http-status-codes");

/**
 * Maps raw database-level errors to standard application CustomErrors
 * @param {Error|any} err
 * @returns {CustomError}
 */
const translateDatabaseError = (err) => {
  // If already an application CustomError, pass through
  if (err instanceof CustomError) {
    return err;
  }

  // PostgreSQL unique constraint violation (23505)
  if (err.code === "23505") {
    const detail = err.detail || "";
    if (detail.includes("email") || err.constraint?.includes("email")) {
      return new CustomError(
        "An account with this email address already exists. Please log in.",
        StatusCodes.BAD_REQUEST
      );
    }
    if (detail.includes("url_id") || err.constraint?.includes("url_id")) {
      return new CustomError(
        "Alias or Short ID is already in use. Please choose another one.",
        StatusCodes.BAD_REQUEST
      );
    }
    return new CustomError(
      "A duplicate entry was detected for a unique field.",
      StatusCodes.BAD_REQUEST
    );
  }

  // PostgreSQL foreign key violation (23503)
  if (err.code === "23503") {
    return new CustomError(
      "Referenced resource does not exist.",
      StatusCodes.BAD_REQUEST
    );
  }

  // PostgreSQL invalid input syntax (22P02)
  if (err.code === "22P02") {
    return new CustomError(
      "Invalid identifier or data format provided.",
      StatusCodes.BAD_REQUEST
    );
  }

  // PostgreSQL connection errors
  if (err.code === "08006" || err.code === "08001" || err.code === "ECONNREFUSED") {
    console.error("Database connection failure:", err.message);
    return new CustomError(
      "Database service temporarily unavailable. Please try again shortly.",
      StatusCodes.SERVICE_UNAVAILABLE
    );
  }

  // Generic fallback without exposing internals
  console.error("Unhandled Database Error:", err.message);
  return new CustomError(
    "A database error occurred while processing your request.",
    StatusCodes.INTERNAL_SERVER_ERROR
  );
};

module.exports = {
  translateDatabaseError,
};
