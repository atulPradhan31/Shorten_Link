/**
 * Link Domain Entity
 * Encapsulates link domain state independent of storage mechanics.
 */
class Link {
  /**
   * @param {Object} params
   * @param {string} params.id
   * @param {string} params.userId
   * @param {string} params.originalUrl
   * @param {string} params.urlId
   * @param {number|string} [params.click]
   * @param {Date|string} [params.createdAt]
   * @param {Date|string} [params.updatedAt]
   */
  constructor({
    id,
    userId,
    originalUrl,
    urlId,
    click = 0,
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id;
    this.userId = userId;
    this.originalUrl = originalUrl;
    this.urlId = urlId;
    this.click = typeof click === "string" ? parseInt(click, 10) || 0 : Number(click) || 0;
    this.createdAt = createdAt instanceof Date ? createdAt.toISOString() : createdAt;
    this.updatedAt = updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt;
  }

  get _id() {
    return this.id;
  }

  set _id(val) {
    this.id = val;
  }

  get user_id() {
    return this.userId;
  }

  set user_id(val) {
    this.userId = val;
  }

  toDTO() {
    return {
      _id: this.id,
      id: this.id,
      user_id: this.userId,
      userId: this.userId,
      originalUrl: this.originalUrl,
      urlId: this.urlId,
      click: this.click,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toJSON() {
    return this.toDTO();
  }
}

module.exports = Link;
