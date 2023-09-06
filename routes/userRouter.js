const express = require("express");
const {
  getLinks,
  createLink,
  updateLink,
  removeLink,
} = require("../controllers/linksModification");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .get(authMiddleware, getLinks)
  .post(authMiddleware, createLink); //need to update getLinks as soon as we have Auth configured
router
  .route("/:id")
  .patch(authMiddleware, updateLink)
  .delete(authMiddleware, removeLink); //need to update patch(updateLink).delete(removeLink) as soon as we have Auth configured
module.exports = router;
