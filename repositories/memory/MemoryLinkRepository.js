const ILinkRepository = require("../contracts/ILinkRepository");
const Link = require("../../domain/entities/Link");
const crypto = require("crypto");

class MemoryLinkRepository extends ILinkRepository {
  constructor() {
    super();
    /** @type {Map<string, Link>} */
    this.links = new Map();
  }

  async create(linkData) {
    const { id = crypto.randomUUID(), userId, originalUrl, urlId, click = 0 } = linkData;
    const link = new Link({
      id,
      userId,
      originalUrl,
      urlId,
      click,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.links.set(id, link);
    return new Link({ ...link });
  }

  async findById(id, userId) {
    const link = this.links.get(id);
    if (!link) return null;
    if (userId && link.userId !== userId) return null;
    return new Link({ ...link });
  }

  async findByUrlId(urlId) {
    for (const link of this.links.values()) {
      if (link.urlId === urlId) {
        return new Link({ ...link });
      }
    }
    return null;
  }

  async findUserUrls(userId, options = {}) {
    const { limit = 100, offset = 0 } = options;
    const userLinks = [];
    for (const link of this.links.values()) {
      if (link.userId === userId) {
        userLinks.push(new Link({ ...link }));
      }
    }
    userLinks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return userLinks.slice(offset, offset + limit);
  }

  async incrementClickCount(urlId) {
    for (const link of this.links.values()) {
      if (link.urlId === urlId) {
        link.click += 1;
        link.updatedAt = new Date().toISOString();
        return new Link({ ...link });
      }
    }
    return null;
  }

  async update(id, userId, updateData) {
    const link = this.links.get(id);
    if (!link || link.userId !== userId) return null;

    if (updateData.originalUrl !== undefined) link.originalUrl = updateData.originalUrl;
    if (updateData.urlId !== undefined) link.urlId = updateData.urlId;
    link.updatedAt = new Date().toISOString();

    return new Link({ ...link });
  }

  async delete(id, userId) {
    const link = this.links.get(id);
    if (!link || link.userId !== userId) return null;
    this.links.delete(id);
    return new Link({ ...link });
  }

  async isUrlIdTaken(urlId, excludeId) {
    for (const link of this.links.values()) {
      if (link.urlId === urlId && (!excludeId || link.id !== excludeId)) {
        return true;
      }
    }
    return false;
  }

  async countByUser(userId) {
    let count = 0;
    for (const link of this.links.values()) {
      if (link.userId === userId) count++;
    }
    return count;
  }

  async count() {
    return this.links.size;
  }
}

module.exports = MemoryLinkRepository;
