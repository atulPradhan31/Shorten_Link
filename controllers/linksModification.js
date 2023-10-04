require("dotenv").config();
const Links = require("../models/links");
const CustomError = require("../errors/custom-error");
<<<<<<< HEAD
const {StatusCodes} = require('http-status-codes')

// Get all the links objects
const getLinks = async (req, res) => {
  const allLinks = await Links.find();
  if (!allLinks)
    throw new CustomError(
      "Could not get all the data. Please try again later",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  res.status(200).json(allLinks);
=======
const ShortUniqueId = require("short-unique-id");
const isValidURL = require("../modules/validation");

const { StatusCodes } = require("http-status-codes");
const UsersData = require("../models/user");

// Get all the links objects
const getLinks = async (req, res) => {

  const user = await UsersData.findById(req.user._id).populate('MyLinks').exec();
  res.status(StatusCodes.OK).json({msg : user.MyLinks});

>>>>>>> origin/master
};

// Create a new entry
const createLink = async (req, res) => {
  const origUrl = req.body.originalUrl;

  if (!origUrl || !isValidURL(origUrl))
    throw new CustomError("Please enter valid URL", StatusCodes.BAD_REQUEST);

  let isIdUnique = true;
  let urlId = true;

  while (isIdUnique) {
    urlId = new ShortUniqueId({ length: 7 })();
    isIdUnique = await Links.findOne({ urlId });
  }
  req.body.urlId = urlId;
  req.body.user_id = req.user._id;
  const entry = await Links.create(req.body);

  if (!entry)
    throw new CustomError(
      "Could not create the entry. Please try again later",
      StatusCodes.INTERNAL_SERVER_ERROR
    );

  res.status(StatusCodes.CREATED).json(entry);
};

<<<<<<< HEAD
// Lookup the specific data
const getLink = async (req, res) => {
  const linkID = req.params.id;
  
  if (!linkID)
    throw new CustomError("No object ID defined.", 404);
=======
// Update the existing entry with new data
const updateLink = async (req, res) => {
  const urlId = req.body.urlId;
  const newUrl = req.body.originalUrl;
>>>>>>> origin/master

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

  const isUrlExist = await Links.findOne({urlId: newUrlId});
  console.log(isUrlExist);
  if(isUrlExist)
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
  updateUrlId
};
