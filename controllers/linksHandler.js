const ShortUniqueId = require("short-unique-id");
const isValidURL = require("../modules/validation");
require("dotenv").config();
const CustomError = require("../errors/custom-error");
const Links = require("../models/links");
const { StatusCodes } = require("http-status-codes");

 async function handleCreateNewLink(req) {
  const originalUrl = req.body.originalUrl;
  console.log(req.body);
  if (!originalUrl || !isValidURL(originalUrl))
    throw new CustomError("Please enter valid URL", StatusCodes.BAD_REQUEST);

  let isIdUnique = true;
  let urlId = true;

  while (isIdUnique) {
    urlId = new ShortUniqueId({ length: 7 })();
    isIdUnique = await Links.findOne({ urlId });
  }
  req.body.urlId = urlId;
  // req.body.user_id = req.user._id;
  return {...req.body};
}


module.exports = {
  handleCreateNewLink,
};