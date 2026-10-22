const IUserRepository = require("../contracts/IUserRepository");
const User = require("../../domain/entities/User");
const CustomError = require("../../errors/custom-error");
const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");

class MemoryUserRepository extends IUserRepository {
  constructor() {
    super();
    /** @type {Map<string, User>} */
    this.users = new Map();
  }

  async findById(id) {
    const user = this.users.get(id);
    return user ? new User({ ...user, tokens: [...user.tokens] }) : null;
  }

  async findByEmail(email) {
    const normalized = (email || "").toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email === normalized) {
        return new User({ ...user, tokens: [...user.tokens] });
      }
    }
    return null;
  }

  async create(userData) {
    const { name, email, password, id = crypto.randomUUID() } = userData;
    const normalized = email.toLowerCase().trim();

    if (await this.findByEmail(normalized)) {
      throw new CustomError(
        "An account with this email address already exists. Please log in.",
        StatusCodes.BAD_REQUEST
      );
    }

    const user = new User({
      id,
      name: name.trim(),
      email: normalized,
      password,
      tokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.users.set(id, user);
    return new User({ ...user, tokens: [] });
  }

  async update(id, updateData) {
    const user = this.users.get(id);
    if (!user) return null;

    if (updateData.name !== undefined) user.name = updateData.name.trim();
    if (updateData.password !== undefined) user.password = updateData.password;
    if (updateData.email !== undefined) user.email = updateData.email.toLowerCase().trim();
    user.updatedAt = new Date().toISOString();

    return new User({ ...user, tokens: [...user.tokens] });
  }

  async addToken(userId, token) {
    const user = this.users.get(userId);
    if (user) {
      user.tokens.push({ token, createdAt: new Date() });
    }
  }

  async removeToken(userId, token) {
    const user = this.users.get(userId);
    if (user) {
      user.tokens = user.tokens.filter((t) => t.token !== token);
    }
  }

  async clearTokens(userId) {
    const user = this.users.get(userId);
    if (user) {
      user.tokens = [];
    }
  }

  async hasToken(userId, token) {
    const user = this.users.get(userId);
    if (!user) return false;
    return user.tokens.some((t) => t.token === token);
  }

  async count() {
    return this.users.size;
  }
}

module.exports = MemoryUserRepository;
