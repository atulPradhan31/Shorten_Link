require("dotenv").config();
const Links = require("../models/links");
const CustomError = require("../errors/custom-error");
const ShortUniqueId = require("short-unique-id");
const isValidURL = require("../modules/validation");
const { handleCreateNewLink }  = require('../controllers/linksHandler.js')
const { StatusCodes } = require("http-status-codes");
const UsersData = require("../models/user");

// Get all the links objects
const getLinks = async (req, res) => {
  const user = await UsersData.findById(req.user._id)
    .populate("MyLinks")
    .exec();
  res.status(StatusCodes.OK).json({ msg: user.MyLinks });
};

/* -------------------------------------------------------------------------- */
/*                            // Create a new entry                           */
/* -------------------------------------------------------------------------- */


const createLink = async (req, res) => {

  const dataToCreateLink = await handleCreateNewLink(req);
  dataToCreateLink.user_id = req.user._id;
  const entry = await Links.create(dataToCreateLink);

  if (!entry)
    throw new CustomError(
      "Could not create the entry. Please try again later",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  res.status(StatusCodes.CREATED).json(entry);
  
};

// Update the existing entry with new data
const updateLink = async (req, res) => {
  const urlId = req.body.urlId;
  const newUrl = req.body.originalUrl;

  if (!urlId || !newUrl)
    throw new CustomError(
      "Data entry incomplete. Please enter complete data. ",
      StatusCodes.BAD_REQUEST
    );

  if (!isValidURL(newUrl))
    throw new CustomError("Please enter valid URL", StatusCodes.BAD_REQUEST);

  let urlObj = await Links.findOneAndUpdate(
    { urlId: urlId },
    { originalUrl: newUrl },
    { new: true, runValidators: true }
  );

  if (!urlObj)
    throw new CustomError(
      `Could not update the entry with the id ${urlId}. Please try again later!`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  res.status(StatusCodes.OK).json(urlObj);
};

// Update the existing url with new data
const updateUrlId = async (req, res) => {
  const urlId = req.body.urlId;
  const newUrlId = req.body.newUrlId;

  if (!urlId || !newUrlId)
    throw new CustomError(
      "Data entry incomplete. Please enter complete data. ",
      StatusCodes.BAD_REQUEST
    );

  const isUrlExist = await Links.findOne({ urlId: newUrlId });
  console.log(isUrlExist);
  if (isUrlExist)
    throw new CustomError(`URL Id already exists.`, StatusCodes.BAD_REQUEST);

  let urlObj = await Links.findOneAndUpdate(
    { urlId },
    { urlId: newUrlId },
    { new: true, runValidators: true }
  );

  if (!urlObj)
    throw new CustomError(
      `Could not update the entry with the id ${urlId}. Please try again later!`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  res.status(StatusCodes.OK).json(urlObj);
};

// Lookup and delete the entry corresponding to the requested object Id.
const removeLink = async (req, res) => {
  const urlId = req.params.id;

  if (!urlId)
    throw new CustomError(
      "No url Id entered. Please enter an id. ",
      StatusCodes.BAD_REQUEST
    );

  const urlObj = await Links.findOneAndDelete({ urlId });
  if (!urlObj)
    throw new CustomError(
      `Could not delete the entry with the id ${urlId}. Please try again later. `,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  res
    .status(StatusCodes.ACCEPTED)
    .json(
      `Removed the entry with original url ${urlObj.originalUrl} and short url ${urlObj.shortenedUrl}}`
    );
};

module.exports = {
  getLinks,
  createLink,
  updateLink,
  removeLink,
  updateUrlId,
};
