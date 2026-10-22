const express = require("express");
const {
  getLinks,
  getSingleLink,
  createLink,
  updateLink,
  removeLink,
} = require("../controllers/linksModification");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware); // Protect all link routes

router.route("/")
  .get(getLinks)
  .post(createLink);

router.route("/:id")
  .get(getSingleLink)
  .patch(updateLink)
  .delete(removeLink);

module.exports = router;
