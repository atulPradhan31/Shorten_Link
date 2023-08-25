const Links = require("../models/links");
const CustomError = require("../errors/custom-error");
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
};

// Create a new entry
const createLink = async (req, res) => {
  const body = req.body;
  if (!body)
    throw new CustomError("Please enter valid data", StatusCodes.BAD_REQUEST);
  const entry = await Links.create(req.body);
  if (!entry)
    throw new CustomError(
      "Could not create the entry. Please try again later",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  res.status(StatusCodes.OK).json(entry);
};

// Lookup the specific data
const getLink = async (req, res) => {
  const linkID = req.params.id;
  
  if (!linkID)
    throw new CustomError("No object ID defined.", 404);

  const linkObj = await Links.findById(linkID);
  if (!linkObj)
    throw new CustomError(
      `No object found with the id ${linkID}`,
      StatusCodes.NOT_FOUND
    );

  res.status(StatusCodes.OK).json(linkObj);
};

// Update the existing entry with new data
const updateLink = async (req, res) => {
  const linkID = req.params.id;
  const body = req.body;

  if (!body || !linkID)
    throw new CustomError(
      "Data entry missing. Please enter complete data. ",
      StatusCodes.BAD_REQUEST
    );

  let linkObj = await Links.findByIdAndUpdate(linkID, body, {
    new: true,
    runValidators: true,
  });

  if (!linkObj)
    throw new CustomError(
      `Could not update the entry with the id ${linkID}. Please try again later!`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );

  res.status(StatusCodes.OK).json(linkObj);
};

// Lookup and delete the entry corresponding to the requested object Id.
const removeLink = async (req, res) => {
  const linkID = req.params.id;

  if (!linkID)
    throw new CustomError(
      "No object ID entered. Please enter the id. ",
      StatusCodes.BAD_REQUEST
    );

  const linkObj = await Links.findByIdAndDelete(linkID);
  if (!linkObj)
    throw new CustomError(
      `Could not delete the entry with the id ${linkID}. Please try again later. `,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  res
    .status(StatusCodes.OK)
    .json(
      `Removed the link with original link ${linkObj.originalLink} and short link ${linkObj.shortenedLink}}`
    );
};

module.exports = {
  getLinks,
  createLink,
  getLink,
  updateLink,
  removeLink,
};
