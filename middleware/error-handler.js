const { StatusCodes } = require("http-status-codes");

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || 400,
    message: err.message || "Something went wrong. Please try again later",
  };

  if (err.name === "CastError") {
    customError.message = "Object id is not valid. Please enter a valid id.";
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }
  else if (err.name === "ValidationError") {
    customError.message = "Invalid data entered!";
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }
  console.log(customError);
  return res.status(customError.statusCode).json({ message: customError.message });
};

module.exports = errorHandlerMiddleware;
