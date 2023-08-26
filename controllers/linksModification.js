require("dotenv").config();
const Links = require("../models/links");
const CustomError = require("../errors/custom-error");
const ShortUniqueId = require("short-unique-id");
const isValidURL = require("../modules/validation");

const { StatusCodes } = require("http-status-codes");

// Get all the links objects
const getLinks = async (req, res) => {
  const allLinks = await Links.find();
  if (!allLinks)
    throw new CustomError(
      "Could not get all the data. Please try again later",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  res.status(StatusCodes.OK).json(allLinks);
};

// Create a new entry
const createLink = async (req, res) => {
  const origUrl = req.body.originalUrl;
  if (!origUrl || !isValidURL(origUrl))
    throw new CustomError("Please enter valid URL", StatusCodes.BAD_REQUEST);

  const uid = new ShortUniqueId({ length: 16 })();
  const shortenedUrl = `${uid}`;

  req.body.shortenedUrl = shortenedUrl;
  req.body.urlId = uid;

  const entry = await Links.create(req.body);

  if (!entry)
    throw new CustomError(
      "Could not create the entry. Please try again later",
      StatusCodes.INTERNAL_SERVER_ERROR
    );

  res.status(StatusCodes.CREATED).json(entry);
};

// Lookup the specific data
const getLink = async (req, res) => {
  const urlId = req.params.id;
  if (!urlId)
    throw new CustomError("No object ID defined.", StatusCodes.BAD_REQUEST);

  const urlObj = await Links.findOne({ urlId: urlId });
  if (!urlObj)
    throw new CustomError(
      `No data found with the id ${urlId}`,
      StatusCodes.NOT_FOUND
    );

  res.status(StatusCodes.OK).json(urlObj);
};

// Update the existing entry with new data
const updateLink = async (req, res) => {
  const urlId = req.params.id;
  const newUrl = req.body.originalUrl;

  if (!urlId || !newUrl)
    throw new CustomError(
      "Data entry incomplete. Please enter complete data. ",
      StatusCodes.BAD_REQUEST
    );

  console.log(newUrl);

  if (!isValidURL(newUrl))
    throw new CustomError("Please enter valid URL", StatusCodes.BAD_REQUEST);

  let urlObj = await Links.findOneAndUpdate(
    { urlId: urlId },
    { originalUrl: newUrl },
    {
      new: true,
      runValidators: true,
    }
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

  const urlObj = await Links.findOneAndDelete({ urlId: urlId });
  if (!urlObj)
    throw new CustomError(
      `Could not delete the entry with the id ${urlId}. Please try again later. `,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  res
    .status(StatusCodes.OK)
    .json(
      `Removed the entry with original url ${urlObj.originalUrl} and short url ${urlObj.shortenedUrl}}`
    );
};

module.exports = {
  getLinks,
  createLink,
  getLink,
  updateLink,
  removeLink,
};
