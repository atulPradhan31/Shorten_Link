const express = require("express");
const { StatusCodes } = require("http-status-codes");
const { container } = require("../container");
const router = express.Router();

router.get("/:id", async (req, res) => {
  const urlId = req.params.id;
  const linkService = container.getLinkService();

  const { destination } = await linkService.resolveAndIncrementClick(urlId);

  return res.status(StatusCodes.MOVED_TEMPORARILY).redirect(destination);
});

module.exports = router;