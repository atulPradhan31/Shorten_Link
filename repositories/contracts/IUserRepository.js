/**
 * @typedef {import("../../domain/entities/User")} User
 */

/**
 * Interface contract for User data access
 * @interface IUserRepository
 */
class IUserRepository {
  /**
   * Find a user by their unique primary identifier
   * @param {string} id
   * @returns {Promise<User|null>}
   */
  async findById(id) {
    throw new Error("Method findById() must be implemented.");
  }

  /**
   * Find a user by their email address
   * @param {string} email
   * @returns {Promise<User|null>}
   */
  async findByEmail(email) {
    throw new Error("Method findByEmail() must be implemented.");
  }

  /**
   * Create a new user record
   * @param {Object} userData
   * @param {string} [userData.id]
   * @param {string} userData.name
   * @param {string} userData.email
   * @param {string} userData.password
   * @returns {Promise<User>}
   */
  async create(userData) {
    throw new Error("Method create() must be implemented.");
  }

  /**
   * Update an existing user record
   * @param {string} id
   * @param {Object} updateData
   * @returns {Promise<User|null>}
   */
  async update(id, updateData) {
    throw new Error("Method update() must be implemented.");
  }

  /**
   * Add an active session token for a user
   * @param {string} userId
   * @param {string} token
   * @returns {Promise<void>}
   */
  async addToken(userId, token) {
    throw new Error("Method addToken() must be implemented.");
  }

  /**
   * Invalidate a single session token for a user
   * @param {string} userId
   * @param {string} token
   * @returns {Promise<void>}
   */
  async removeToken(userId, token) {
    throw new Error("Method removeToken() must be implemented.");
  }

  /**
   * Invalidate all session tokens for a user across all devices
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async clearTokens(userId) {
    throw new Error("Method clearTokens() must be implemented.");
  }

  /**
   * Verify whether a specific session token exists and is valid
   * @param {string} userId
   * @param {string} token
   * @returns {Promise<boolean>}
   */
  async hasToken(userId, token) {
    throw new Error("Method hasToken() must be implemented.");
  }

  /**
   * Total number of users
   * @returns {Promise<number>}
   */
  async count() {
    throw new Error("Method count() must be implemented.");
  }
}

module.exports = IUserRepository;
