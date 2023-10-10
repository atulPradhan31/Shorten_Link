const { StatusCodes } = require("http-status-codes");

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || 400,
    msg: err.message || "Something went wrong. Please try again later",
  };

  if (err.name === "CastError") {
    customError.msg = "Object id is valid. Please enter a valid id.";
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }
  if (err.name === "ValidationError") {
    // customError.msg = "Invalid data entered!";
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }
  console.log(customError);
  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
