/**
 * @typedef {import("../../domain/entities/Link")} Link
 */

/**
 * Interface contract for Link data access
 * @interface ILinkRepository
 */
class ILinkRepository {
  /**
   * Create a new short link
   * @param {Object} linkData
   * @param {string} [linkData.id]
   * @param {string} linkData.userId
   * @param {string} linkData.originalUrl
   * @param {string} linkData.urlId
   * @param {number} [linkData.click]
   * @returns {Promise<Link>}
   */
  async create(linkData) {
    throw new Error("Method create() must be implemented.");
  }

  /**
   * Find a link by its primary identifier and owning user
   * @param {string} id
   * @param {string} [userId]
   * @returns {Promise<Link|null>}
   */
  async findById(id, userId) {
    throw new Error("Method findById() must be implemented.");
  }

  /**
   * Find a link by its public short code / alias
   * @param {string} urlId
   * @returns {Promise<Link|null>}
   */
  async findByUrlId(urlId) {
    throw new Error("Method findByUrlId() must be implemented.");
  }

  /**
   * Find all links belonging to a user with pagination and sorting
   * @param {string} userId
   * @param {Object} [options]
   * @param {number} [options.limit]
   * @param {number} [options.offset]
   * @param {string} [options.sortField]
   * @param {"ASC"|"DESC"} [options.sortOrder]
   * @returns {Promise<Link[]>}
   */
  async findUserUrls(userId, options) {
    throw new Error("Method findUserUrls() must be implemented.");
  }

  /**
   * Atomically increment the visit count for a short link
   * @param {string} urlId
   * @returns {Promise<Link|null>}
   */
  async incrementClickCount(urlId) {
    throw new Error("Method incrementClickCount() must be implemented.");
  }

  /**
   * Update destination URL or alias for a user's link
   * @param {string} id
   * @param {string} userId
   * @param {Object} updateData
   * @returns {Promise<Link|null>}
   */
  async update(id, userId, updateData) {
    throw new Error("Method update() must be implemented.");
  }

  /**
   * Delete a link scoped to owner
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Link|null>}
   */
  async delete(id, userId) {
    throw new Error("Method delete() must be implemented.");
  }

  /**
   * Check if a short code or alias is already occupied
   * @param {string} urlId
   * @param {string} [excludeId]
   * @returns {Promise<boolean>}
   */
  async isUrlIdTaken(urlId, excludeId) {
    throw new Error("Method isUrlIdTaken() must be implemented.");
  }

  /**
   * Total number of links for a user
   * @param {string} userId
   * @returns {Promise<number>}
   */
  async countByUser(userId) {
    throw new Error("Method countByUser() must be implemented.");
  }

  /**
   * Total number of all links in system
   * @returns {Promise<number>}
   */
  async count() {
    throw new Error("Method count() must be implemented.");
  }
}

module.exports = ILinkRepository;
