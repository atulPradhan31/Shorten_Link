const express = require("express");
const CustomError = require("../errors/custom-error");
const authMiddleware = require("../middleware/authMiddleware");
const ShortUniqueId = require("short-unique-id");
const router = express.Router();
const Client = require("../models/client");
const ClientToken = require("../models/clientToken");
const clientMiddleware = require("../middleware/clientMiddleware");
const { handleCreateNewLink } = require("../controllers/linksHandler.js");
const { StatusCodes } = require("http-status-codes");
const Links = require('../models/links')



/* -------------------------------------------------------------------------- */
/*                                create client                               */
/* -------------------------------------------------------------------------- */

router.get("/create", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) throw new CustomError("Enter valid User Id", 400);

    const anyClient = await Client.find({ userId });
    const isClientAlreadyCreated = anyClient.length > 0;
    // if (isClientAlreadyCreated)
    //   throw new CustomError("You are already a developer", 400);

    const clientPasscode = new ShortUniqueId({ length: 9 })();
    const createClient = {
      userId,
      clientCode: clientPasscode,
    };

    const createdClient = new Client(createClient);
    await createdClient.save();
    createdClient.clientId = createdClient._id;
    await createdClient.save();
    res.status(201).send({
      message: {
        message: "congratulations!, You are now a developer",
        clientId: createdClient._id,
        clientPasscode,
      }
    });
  } catch (error) {
    throw new CustomError(error.message);
  }
});

/* -------------------------------------------------------------------------- */
/*                        create temp token for a user                        */
/* -------------------------------------------------------------------------- */

router.post("/create/token", authMiddleware, async (req, res) => {
  try {
    const clientId = req.body.clientId;

    if (!clientId) throw new CustomError("Enter valid Client Id", 400);

    const anyClient = await Client.findById(clientId);
    if (!anyClient) throw new CustomError("No Client Found!");

    const createdClientToken = new ClientToken({ clientId });
    const oneTimeToken = await createdClientToken.generateToken();
    createdClientToken.token = oneTimeToken;
    await createdClientToken.save();
    console.log(createdClientToken);

    res.status(201).send({message  :{
      message: "Token created",
      token: oneTimeToken,
    }});
  } catch (error) {
    throw new CustomError(error.message);
  }
});

/* -------------------------------------------------------------------------- */
/*                     create a unique Id using client id                     */
/* -------------------------------------------------------------------------- */

router.post("/create/link", clientMiddleware, async (req, res) => {

  try {
    const dataToCreateLink = await handleCreateNewLink(req);
    dataToCreateLink.user_id = req.client._id;
    const options = req.body.options

    const entry = await Links.create({ ...dataToCreateLink, options });
    if (!entry)
      throw new CustomError(
        "Could not create the entry. Please try again later",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    res.status(StatusCodes.CREATED).json({message  :entry});
  } catch (error) {
    throw new CustomError(error.message);
  }
});


module.exports = router;
