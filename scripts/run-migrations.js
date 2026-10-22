require("dotenv").config();
const { runMigrations, rollbackLatest } = require("../migrations/runner");
const { closePool } = require("../db/postgres");

const main = async () => {
  const isRollback = process.argv.includes("--rollback");
  try {
    if (isRollback) {
      await rollbackLatest();
    } else {
      await runMigrations();
    }
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await closePool();
  }
};

main();
