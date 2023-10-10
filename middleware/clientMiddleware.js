require("dotenv").config();
const jwt = require("jsonwebtoken");
const CustomError = require("../errors/custom-error");
const Client = require("../models/clientToken");
const ClientToken = require("../models/client");

const handleClientMiddleware = async (req, res, next) => {
  const token = req.body.token;

  if (!token)
    throw new CustomError("No valid token provided", 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { clientId } = decoded;

    const client = await Client.findById(clientId);
    if (!client)
      throw new CustomError("Not a valid token", 401);

    req.client = client;
    req.token = token;
    next();
  } catch (error) {
    throw new CustomError(
      error.message ? error.message : "Not authorised to access this route",
      401
    );
  }
};

module.exports = handleClientMiddleware;
