const ShortUniqueId = require("short-unique-id");
const CustomError = require("../errors/custom-error");
const { StatusCodes } = require("http-status-codes");
const { isValidURL, normalizeURL } = require("../modules/validation");

class LinkService {
  /**
   * @param {Object} deps
   * @param {import("../repositories/contracts/ILinkRepository")} deps.linkRepository
   */
  constructor({ linkRepository }) {
    if (!linkRepository) {
      throw new Error("LinkService requires a linkRepository instance.");
    }
    this.linkRepository = linkRepository;
    this.uid = new ShortUniqueId({ length: 7 });
    this.reservedSlugs = [
      "api",
      "auth",
      "dashboard",
      "analytics",
      "admin",
      "login",
      "register",
      "public",
      "static",
      "health",
    ];
  }

  /**
   * Validate custom alias format and reserved routes
   * @private
   */
  _validateAlias(alias) {
    if (alias.length < 3 || alias.length > 50) {
      throw new CustomError(
        "Custom alias must be between 3 and 50 characters",
        StatusCodes.BAD_REQUEST
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
      throw new CustomError(
        "Custom alias can only contain letters, numbers, hyphens, and underscores",
        StatusCodes.BAD_REQUEST
      );
    }

    if (this.reservedSlugs.includes(alias.toLowerCase())) {
      throw new CustomError(
        `'${alias}' is a reserved keyword and cannot be used as an alias`,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  /**
   * Create a new short link
   */
  async createLink(userId, { originalUrl, urlId, shortLink }) {
    const customAlias = (urlId || shortLink || "").trim();

    if (!originalUrl || !isValidURL(originalUrl)) {
      throw new CustomError(
        "Please provide a valid destination URL (e.g., https://example.com)",
        StatusCodes.BAD_REQUEST
      );
    }

    const normalizedDestination = normalizeURL(originalUrl);
    let finalUrlId = "";

    if (customAlias) {
      this._validateAlias(customAlias);

      const isTaken = await this.linkRepository.isUrlIdTaken(customAlias);
      if (isTaken) {
        throw new CustomError(
          `Alias '${customAlias}' is already in use. Please choose another one.`,
          StatusCodes.BAD_REQUEST
        );
      }
      finalUrlId = customAlias;
    } else {
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        attempts++;
        finalUrlId = this.uid();
        const isTaken = await this.linkRepository.isUrlIdTaken(finalUrlId);
        if (!isTaken) isUnique = true;
      }

      if (!isUnique) {
        throw new CustomError(
          "Failed to generate unique short ID. Please try again.",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
    }

    const link = await this.linkRepository.create({
      userId,
      originalUrl: normalizedDestination,
      urlId: finalUrlId,
      click: 0,
    });

    return link.toDTO();
  }

  /**
   * Get all links belonging to a user
   */
  async getUserLinks(userId, options = {}) {
    const links = await this.linkRepository.findUserUrls(userId, options);
    return {
      count: links.length,
      links: links.map((l) => l.toDTO()),
    };
  }

  /**
   * Get a single link by ID scoped to owner
   */
  async getLinkById(id, userId) {
    const link = await this.linkRepository.findById(id, userId);
    if (!link) {
      throw new CustomError(`No link found with ID ${id}`, StatusCodes.NOT_FOUND);
    }
    return link.toDTO();
  }

  /**
   * Atomically increment click count and retrieve destination for redirection
   */
  async resolveAndIncrementClick(urlId) {
    if (!urlId || typeof urlId !== "string") {
      throw new CustomError("Invalid URL ID", StatusCodes.BAD_REQUEST);
    }

    const link = await this.linkRepository.incrementClickCount(urlId);
    if (!link) {
      throw new CustomError("Short link not found or expired", StatusCodes.NOT_FOUND);
    }

    return {
      destination: normalizeURL(link.originalUrl),
      link: link.toDTO(),
    };
  }

  /**
   * Update a link's destination or alias
   */
  async updateLink(id, userId, { originalUrl, urlId, shortLink }) {
    const newAlias = (urlId || shortLink || "").trim();

    if (!originalUrl && !newAlias) {
      throw new CustomError(
        "Please provide destination URL or custom alias to update",
        StatusCodes.BAD_REQUEST
      );
    }

    const updateData = {};

    if (originalUrl) {
      if (!isValidURL(originalUrl)) {
        throw new CustomError("Invalid destination URL format", StatusCodes.BAD_REQUEST);
      }
      updateData.originalUrl = normalizeURL(originalUrl);
    }

    if (newAlias) {
      this._validateAlias(newAlias);

      const isTaken = await this.linkRepository.isUrlIdTaken(newAlias, id);
      if (isTaken) {
        throw new CustomError(
          `Alias '${newAlias}' is already in use by another link`,
          StatusCodes.BAD_REQUEST
        );
      }
      updateData.urlId = newAlias;
    }

    const link = await this.linkRepository.update(id, userId, updateData);
    if (!link) {
      throw new CustomError(`No link found with ID ${id}`, StatusCodes.NOT_FOUND);
    }

    return link.toDTO();
  }

  /**
   * Delete a link
   */
  async deleteLink(id, userId) {
    const link = await this.linkRepository.delete(id, userId);
    if (!link) {
      throw new CustomError(`No link found with ID ${id}`, StatusCodes.NOT_FOUND);
    }
    return link.toDTO();
  }
}

module.exports = LinkService;
