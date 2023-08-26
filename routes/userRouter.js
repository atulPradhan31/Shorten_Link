const express = require("express");
const {
  getLinks,
  createLink,
  updateLink,
  removeLink,
} = require("../controllers/linksModification");

const router = express.Router();

router.route("/").get(getLinks).post(createLink); //need to update getLinks as soon as we have Auth configured 
router.route("/:id").patch(updateLink).delete(removeLink); //need to update patch(updateLink).delete(removeLink) as soon as we have Auth configured 
module.exports = router;
