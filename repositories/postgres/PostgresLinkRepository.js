const ILinkRepository = require("../contracts/ILinkRepository");
const Link = require("../../domain/entities/Link");
const { translateDatabaseError } = require("../errors/DatabaseError");
const defaultDb = require("../../db/postgres");

class PostgresLinkRepository extends ILinkRepository {
  /**
   * @param {Object} [deps]
   * @param {typeof defaultDb} [deps.db]
   */
  constructor(deps = {}) {
    super();
    this.db = deps.db || defaultDb;
  }

  /**
   * @private
   */
  _mapToLink(row) {
    if (!row) return null;
    return new Link({
      id: row.id,
      userId: row.user_id,
      originalUrl: row.original_url,
      urlId: row.url_id,
      click: row.click,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async create(linkData) {
    try {
      const { id, userId, originalUrl, urlId, click = 0 } = linkData;
      let sql;
      let params;

      if (id) {
        sql = `
          INSERT INTO links (id, user_id, original_url, url_id, click, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          RETURNING id, user_id, original_url, url_id, click, created_at, updated_at;
        `;
        params = [id, userId, originalUrl.trim(), urlId.trim(), click];
      } else {
        sql = `
          INSERT INTO links (user_id, original_url, url_id, click, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          RETURNING id, user_id, original_url, url_id, click, created_at, updated_at;
        `;
        params = [userId, originalUrl.trim(), urlId.trim(), click];
      }

      const res = await this.db.query(sql, params);
      return this._mapToLink(res.rows[0]);
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async findById(id, userId) {
    try {
      let sql;
      let params;

      if (userId) {
        sql = `
          SELECT id, user_id, original_url, url_id, click, created_at, updated_at
          FROM links
          WHERE id = $1 AND user_id = $2;
        `;
        params = [id, userId];
      } else {
        sql = `
          SELECT id, user_id, original_url, url_id, click, created_at, updated_at
          FROM links
          WHERE id = $1;
        `;
        params = [id];
      }

      const res = await this.db.query(sql, params);
      return this._mapToLink(res.rows[0]);
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async findByUrlId(urlId) {
    try {
      const res = await this.db.query(
        `SELECT id, user_id, original_url, url_id, click, created_at, updated_at
         FROM links
         WHERE url_id = $1;`,
        [urlId.trim()]
      );
      return this._mapToLink(res.rows[0]);
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async findUserUrls(userId, options = {}) {
    try {
      const {
        limit = 100,
        offset = 0,
        sortField = "created_at",
        sortOrder = "DESC",
      } = options;

      // Allowlist safe sort columns to prevent SQL injection
      const allowedColumns = {
        created_at: "created_at",
        createdAt: "created_at",
        click: "click",
        clicks: "click",
        url_id: "url_id",
        urlId: "url_id",
      };

      const safeColumn = allowedColumns[sortField] || "created_at";
      const safeOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

      const sql = `
        SELECT id, user_id, original_url, url_id, click, created_at, updated_at
        FROM links
        WHERE user_id = $1
        ORDER BY ${safeColumn} ${safeOrder}
        LIMIT $2 OFFSET $3;
      `;

      const res = await this.db.query(sql, [userId, limit, offset]);
      return res.rows.map((r) => this._mapToLink(r));
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async incrementClickCount(urlId) {
    try {
      // Atomic increment under high concurrency
      const sql = `
        UPDATE links
        SET click = click + 1, updated_at = NOW()
        WHERE url_id = $1
        RETURNING id, user_id, original_url, url_id, click, created_at, updated_at;
      `;
      const res = await this.db.query(sql, [urlId.trim()]);
      return this._mapToLink(res.rows[0]);
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async update(id, userId, updateData) {
    try {
      const fields = [];
      const values = [];
      let index = 1;

      if (updateData.originalUrl !== undefined) {
        fields.push(`original_url = $${index++}`);
        values.push(updateData.originalUrl.trim());
      }
      if (updateData.urlId !== undefined) {
        fields.push(`url_id = $${index++}`);
        values.push(updateData.urlId.trim());
      }

      if (fields.length === 0) {
        return this.findById(id, userId);
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);
      const idParamIndex = index++;
      values.push(userId);
      const userParamIndex = index++;

      const sql = `
        UPDATE links
        SET ${fields.join(", ")}
        WHERE id = $${idParamIndex} AND user_id = $${userParamIndex}
        RETURNING id, user_id, original_url, url_id, click, created_at, updated_at;
      `;

      const res = await this.db.query(sql, values);
      return this._mapToLink(res.rows[0]);
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async delete(id, userId) {
    try {
      const sql = `
        DELETE FROM links
        WHERE id = $1 AND user_id = $2
        RETURNING id, user_id, original_url, url_id, click, created_at, updated_at;
      `;
      const res = await this.db.query(sql, [id, userId]);
      return this._mapToLink(res.rows[0]);
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async isUrlIdTaken(urlId, excludeId) {
    try {
      const sql = `
        SELECT 1 FROM links
        WHERE url_id = $1 AND ($2::varchar IS NULL OR id != $2)
        LIMIT 1;
      `;
      const res = await this.db.query(sql, [urlId.trim(), excludeId || null]);
      return res.rows.length > 0;
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async countByUser(userId) {
    try {
      const res = await this.db.query(
        "SELECT COUNT(*) AS total FROM links WHERE user_id = $1;",
        [userId]
      );
      return parseInt(res.rows[0].total, 10);
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async count() {
    try {
      const res = await this.db.query("SELECT COUNT(*) AS total FROM links;");
      return parseInt(res.rows[0].total, 10);
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }
}

module.exports = PostgresLinkRepository;
