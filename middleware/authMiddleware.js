require("dotenv").config();
const jwt = require("jsonwebtoken");
const CustomError = require("../errors/custom-error");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");

const authHandlerMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer "))
    throw new CustomError("No valid token provided", StatusCodes.UNAUTHORIZED);

  const token = authorization.split(" ")[1];
 
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { userId } = decoded;

    const user = await User.findById(userId);
    if (!user)
      throw new CustomError(
        "No user available with this email address. ",
        StatusCodes.UNAUTHORIZED
      );
    req.user = user;
    req.token  = token;
    next();

  } catch (error) {
    throw new CustomError(
      "Not authorised to access this route",
      StatusCodes.UNAUTHORIZED
    );
  }
};

module.exports = authHandlerMiddleware;
