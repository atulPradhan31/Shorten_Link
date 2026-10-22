const { Pool } = require("pg");
const { dbConfig } = require("../config/database");

let pool = null;

const getPool = () => {
  if (!pool) {
    pool = new Pool(dbConfig);

    pool.on("error", (err) => {
      console.error("Unexpected error on idle PostgreSQL client:", err.message);
    });
  }
  return pool;
};

/**
 * Execute a parameterized query using the pool
 * @param {string} text - SQL query string with $1, $2, etc.
 * @param {Array<any>} [params] - Query parameters
 * @returns {Promise<import("pg").QueryResult>}
 */
const query = async (text, params) => {
  const start = Date.now();
  const currentPool = getPool();
  try {
    const res = await currentPool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === "development" && duration > 100) {
      console.warn(`[Slow Query] (${duration}ms): ${text.replace(/\s+/g, " ").trim()}`);
    }
    return res;
  } catch (error) {
    error.query = text;
    throw error;
  }
};

/**
 * Acquire a dedicated client from the pool
 * @returns {Promise<import("pg").PoolClient>}
 */
const getClient = async () => {
  const currentPool = getPool();
  return await currentPool.connect();
};

/**
 * Execute a unit of work inside an ACID transaction
 * @template T
 * @param {(client: import("pg").PoolClient) => Promise<T>} callback
 * @returns {Promise<T>}
 */
const withTransaction = async (callback) => {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Check if the database connection is healthy
 * @returns {Promise<boolean>}
 */
const checkConnection = async () => {
  try {
    const res = await query("SELECT 1 AS status;");
    return res.rows[0]?.status === 1;
  } catch (error) {
    console.error("PostgreSQL health check failed:", error.message);
    return false;
  }
};

/**
 * Close the connection pool gracefully
 */
const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("PostgreSQL connection pool closed successfully");
  }
};

module.exports = {
  getPool,
  query,
  getClient,
  withTransaction,
  checkConnection,
  closePool,
};
