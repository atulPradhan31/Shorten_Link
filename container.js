const PostgresUserRepository = require("./repositories/postgres/PostgresUserRepository");
const PostgresLinkRepository = require("./repositories/postgres/PostgresLinkRepository");
const AuthService = require("./services/AuthService");
const LinkService = require("./services/LinkService");

/**
 * Dependency Injection Container
 * Assembles concrete repository adapters and binds them to domain services.
 */
class Container {
  constructor() {
    this._userRepository = null;
    this._linkRepository = null;
    this._authService = null;
    this._linkService = null;
  }

  /**
   * Set custom repository implementations (useful for unit tests or switching storage backends)
   * @param {Object} repos
   * @param {import("./repositories/contracts/IUserRepository")} [repos.userRepository]
   * @param {import("./repositories/contracts/ILinkRepository")} [repos.linkRepository]
   */
  setRepositories({ userRepository, linkRepository }) {
    if (userRepository) {
      this._userRepository = userRepository;
      this._authService = null; // Invalidate cache to rebuild with new repo
    }
    if (linkRepository) {
      this._linkRepository = linkRepository;
      this._linkService = null; // Invalidate cache to rebuild with new repo
    }
  }

  /**
   * @returns {import("./repositories/contracts/IUserRepository")}
   */
  getUserRepository() {
    if (!this._userRepository) {
      this._userRepository = new PostgresUserRepository();
    }
    return this._userRepository;
  }

  /**
   * @returns {import("./repositories/contracts/ILinkRepository")}
   */
  getLinkRepository() {
    if (!this._linkRepository) {
      this._linkRepository = new PostgresLinkRepository();
    }
    return this._linkRepository;
  }

  /**
   * @returns {AuthService}
   */
  getAuthService() {
    if (!this._authService) {
      this._authService = new AuthService({
        userRepository: this.getUserRepository(),
      });
    }
    return this._authService;
  }

  /**
   * @returns {LinkService}
   */
  getLinkService() {
    if (!this._linkService) {
      this._linkService = new LinkService({
        linkRepository: this.getLinkRepository(),
      });
    }
    return this._linkService;
  }
}

// Export singleton instance
const container = new Container();

module.exports = {
  container,
  Container,
};
