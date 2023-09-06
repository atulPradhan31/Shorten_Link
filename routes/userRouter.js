const express = require("express");
const {
  getLinks,
  createLink,
  updateLink,
  removeLink,
  updateUrlId,
} = require("../controllers/linksModification");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .get(authMiddleware, getLinks)
  .post(authMiddleware, createLink); //need to update getLinks as soon as we have Auth configured
router
  .route("/:id")  
  .delete(authMiddleware, removeLink); //need to update patch(updateLink).delete(removeLink) as soon as we have Auth configured

router.route('/update/url').patch(authMiddleware, updateLink)   
router.route('/update/id').patch(authMiddleware, updateUrlId)   

module.exports = router;
