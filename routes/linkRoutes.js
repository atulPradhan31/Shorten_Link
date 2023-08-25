const express = require("express");
const {
  getLinks,
  createLink,
  getLink,
  updateLink,
  removeLink,
} = require("../controllers/linksModification");

const router = express.Router();

router.route("/").get(getLinks).post(createLink);
router.route("/:id").get(getLink).patch(updateLink).delete(removeLink);

/*


*/

module.exports = router;
