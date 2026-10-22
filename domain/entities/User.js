/**
 * User Domain Entity
 * Encapsulates user domain state independent of storage mechanics.
 */
class User {
  /**
   * @param {Object} params
   * @param {string} params.id
   * @param {string} params.name
   * @param {string} params.email
   * @param {string} [params.password]
   * @param {Array<{ token: string, createdAt?: Date }>} [params.tokens]
   * @param {Date|string} [params.createdAt]
   * @param {Date|string} [params.updatedAt]
   */
  constructor({ id, name, email, password = "", tokens = [], createdAt = new Date(), updatedAt = new Date() }) {
    this.id = id;
    this.name = name;
    this.email = email ? email.toLowerCase().trim() : "";
    this.password = password;
    this.tokens = Array.isArray(tokens) ? tokens : [];
    this.createdAt = createdAt instanceof Date ? createdAt.toISOString() : createdAt;
    this.updatedAt = updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt;
  }

  /**
   * MongoDB legacy compatibility getter
   */
  get _id() {
    return this.id;
  }

  set _id(val) {
    this.id = val;
  }

  /**
   * Check if user currently holds an active session token
   * @param {string} token
   * @returns {boolean}
   */
  hasSessionToken(token) {
    return this.tokens.some((t) => t.token === token);
  }

  /**
   * Safe Data Transfer Object without credentials
   * @returns {Object}
   */
  toDTO() {
    return {
      _id: this.id,
      id: this.id,
      name: this.name,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toJSON() {
    return this.toDTO();
  }
}

module.exports = User;
