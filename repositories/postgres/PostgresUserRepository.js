const IUserRepository = require("../contracts/IUserRepository");
const User = require("../../domain/entities/User");
const { translateDatabaseError } = require("../errors/DatabaseError");
const defaultDb = require("../../db/postgres");

class PostgresUserRepository extends IUserRepository {
  /**
   * @param {Object} [deps]
   * @param {typeof defaultDb} [deps.db]
   */
  constructor(deps = {}) {
    super();
    this.db = deps.db || defaultDb;
  }

  /**
   * Helper to map database rows to a User domain instance
   * @private
   */
  _mapToUser(userRow, tokenRows = []) {
    if (!userRow) return null;
    const tokens = tokenRows.map((r) => ({
      token: r.token,
      createdAt: r.created_at,
    }));

    return new User({
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      password: userRow.password,
      tokens,
      createdAt: userRow.created_at,
      updatedAt: userRow.updated_at,
    });
  }

  async findById(id) {
    try {
      const userRes = await this.db.query(
        "SELECT id, name, email, password, created_at, updated_at FROM users WHERE id = $1;",
        [id]
      );
      if (userRes.rows.length === 0) return null;

      const tokenRes = await this.db.query(
        "SELECT token, created_at FROM user_tokens WHERE user_id = $1 ORDER BY created_at ASC;",
        [id]
      );

      return this._mapToUser(userRes.rows[0], tokenRes.rows);
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async findByEmail(email) {
    try {
      const normalized = (email || "").toLowerCase().trim();
      const userRes = await this.db.query(
        "SELECT id, name, email, password, created_at, updated_at FROM users WHERE LOWER(TRIM(email)) = $1;",
        [normalized]
      );
      if (userRes.rows.length === 0) return null;

      const userRow = userRes.rows[0];
      const tokenRes = await this.db.query(
        "SELECT token, created_at FROM user_tokens WHERE user_id = $1 ORDER BY created_at ASC;",
        [userRow.id]
      );

      return this._mapToUser(userRow, tokenRes.rows);
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async create(userData) {
    try {
      const { id, name, email, password } = userData;
      const normalizedEmail = (email || "").toLowerCase().trim();

      let sql;
      let params;

      if (id) {
        sql = `
          INSERT INTO users (id, name, email, password, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          RETURNING id, name, email, password, created_at, updated_at;
        `;
        params = [id, name.trim(), normalizedEmail, password];
      } else {
        sql = `
          INSERT INTO users (name, email, password, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())
          RETURNING id, name, email, password, created_at, updated_at;
        `;
        params = [name.trim(), normalizedEmail, password];
      }

      const res = await this.db.query(sql, params);
      return this._mapToUser(res.rows[0], []);
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async update(id, updateData) {
    try {
      const fields = [];
      const values = [];
      let index = 1;

      if (updateData.name !== undefined) {
        fields.push(`name = $${index++}`);
        values.push(updateData.name.trim());
      }
      if (updateData.password !== undefined) {
        fields.push(`password = $${index++}`);
        values.push(updateData.password);
      }
      if (updateData.email !== undefined) {
        fields.push(`email = $${index++}`);
        values.push(updateData.email.toLowerCase().trim());
      }

      if (fields.length === 0) {
        return this.findById(id);
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const sql = `
        UPDATE users
        SET ${fields.join(", ")}
        WHERE id = $${index}
        RETURNING id, name, email, password, created_at, updated_at;
      `;

      const res = await this.db.query(sql, values);
      if (res.rows.length === 0) return null;

      const tokenRes = await this.db.query(
        "SELECT token, created_at FROM user_tokens WHERE user_id = $1;",
        [id]
      );
      return this._mapToUser(res.rows[0], tokenRes.rows);
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async addToken(userId, token) {
    try {
      await this.db.query(
        "INSERT INTO user_tokens (user_id, token, created_at) VALUES ($1, $2, NOW());",
        [userId, token]
      );
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async removeToken(userId, token) {
    try {
      await this.db.query(
        "DELETE FROM user_tokens WHERE user_id = $1 AND token = $2;",
        [userId, token]
      );
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async clearTokens(userId) {
    try {
      await this.db.query("DELETE FROM user_tokens WHERE user_id = $1;", [userId]);
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async hasToken(userId, token) {
    try {
      const res = await this.db.query(
        "SELECT 1 FROM user_tokens WHERE user_id = $1 AND token = $2 LIMIT 1;",
        [userId, token]
      );
      return res.rows.length > 0;
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async count() {
    try {
      const res = await this.db.query("SELECT COUNT(*) AS total FROM users;");
      return parseInt(res.rows[0].total, 10);
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }
}

module.exports = PostgresUserRepository;
