const fs = require("fs");
const path = require("path");
const { query, withTransaction } = require("../db/postgres");

const ENSURE_SCHEMA_TABLE = `
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

/**
 * Get list of already applied migration versions
 * @returns {Promise<Set<string>>}
 */
const getAppliedMigrations = async () => {
  await query(ENSURE_SCHEMA_TABLE);
  const res = await query("SELECT version FROM schema_migrations ORDER BY id ASC;");
  return new Set(res.rows.map((r) => r.version));
};

/**
 * Execute all pending migrations in chronological order
 */
const runMigrations = async () => {
  console.log("=== Starting PostgreSQL Schema Migrations ===");
  const applied = await getAppliedMigrations();
  const migrationsDir = __dirname;
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  let count = 0;
  for (const file of files) {
    if (!applied.has(file)) {
      console.log(`Applying migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, "utf-8");

      // Extract Up Migration (before Down Migration comment if present)
      const upSql = sqlContent.split(/--\s*Down Migration/i)[0].trim();

      await withTransaction(async (client) => {
        await client.query(upSql);
        await client.query("INSERT INTO schema_migrations (version) VALUES ($1);", [file]);
      });

      console.log(`✓ Migration applied: ${file}`);
      count++;
    }
  }

  if (count === 0) {
    console.log("Database schema is already up-to-date. No pending migrations.");
  } else {
    console.log(`=== Successfully applied ${count} migration(s) ===`);
  }
};

/**
 * Rollback the most recently applied migration
 */
const rollbackLatest = async () => {
  await query(ENSURE_SCHEMA_TABLE);
  const res = await query("SELECT version FROM schema_migrations ORDER BY id DESC LIMIT 1;");
  if (res.rows.length === 0) {
    console.log("No migrations to rollback.");
    return;
  }

  const latestVersion = res.rows[0].version;
  console.log(`Rolling back migration: ${latestVersion}...`);
  const filePath = path.join(__dirname, latestVersion);
  const sqlContent = fs.readFileSync(filePath, "utf-8");

  const parts = sqlContent.split(/--\s*Down Migration/i);
  if (parts.length < 2) {
    throw new Error(`Migration ${latestVersion} has no Down Migration block defined.`);
  }

  // Remove comment prefixes from down SQL
  const downSql = parts[1]
    .split("\n")
    .map((line) => line.replace(/^\s*--\s?/, ""))
    .join("\n")
    .trim();

  await withTransaction(async (client) => {
    await client.query(downSql);
    await client.query("DELETE FROM schema_migrations WHERE version = $1;", [latestVersion]);
  });

  console.log(`✓ Successfully rolled back: ${latestVersion}`);
};

module.exports = {
  runMigrations,
  rollbackLatest,
  getAppliedMigrations,
};
