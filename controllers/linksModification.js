const { container } = require("../container");
const { sendSuccess, sendCreated, sendList } = require("../utils/response");

// Get all links for the authenticated user (sorted newest first)
const getLinks = async (req, res) => {
  const linkService = container.getLinkService();
  const result = await linkService.getUserLinks(req.user.id);

  return sendList(res, {
    items: result.links,
    message: "User links retrieved successfully",
    extra: {
      links: result.links,
      count: result.count,
    },
  });
};

// Get a single link by ID
const getSingleLink = async (req, res) => {
  const { id } = req.params;
  const linkService = container.getLinkService();
  const link = await linkService.getLinkById(id, req.user.id);

  return sendSuccess(res, {
    message: "Link details retrieved successfully",
    data: link,
    extra: {
      link,
    },
  });
};

// Create a new short link (supports auto-generated ID or custom alias)
const createLink = async (req, res) => {
  const linkService = container.getLinkService();
  const link = await linkService.createLink(req.user.id, req.body);

  return sendCreated(res, {
    message: "Short link created successfully",
    data: link,
    extra: {
      link,
    },
  });
};

// Update an existing link
const updateLink = async (req, res) => {
  const { id } = req.params;
  const linkService = container.getLinkService();
  const link = await linkService.updateLink(id, req.user.id, req.body);

  return sendSuccess(res, {
    message: "Link updated successfully",
    data: link,
    extra: {
      link,
    },
  });
};

// Delete a link
const removeLink = async (req, res) => {
  const { id } = req.params;
  const linkService = container.getLinkService();
  const link = await linkService.deleteLink(id, req.user.id);

  return sendSuccess(res, {
    message: "Link removed successfully",
    data: link,
    extra: {
      link,
      msg: "Link removed successfully",
    },
  });
};

module.exports = {
  getLinks,
  getSingleLink,
  createLink,
  updateLink,
  removeLink,
};
