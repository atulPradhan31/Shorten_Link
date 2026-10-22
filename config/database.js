require("dotenv").config();

const parseDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.PGPOOL_SIZE || "20", 10),
      idleTimeoutMillis: parseInt(process.env.PGIDLE_TIMEOUT || "30000", 10),
      connectionTimeoutMillis: parseInt(process.env.PGCONNECTION_TIMEOUT || "5000", 10),
    };
  }

  return {
    host: process.env.PGHOST || "127.0.0.1",
    port: parseInt(process.env.PGPORT || "5433", 10),
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "",
    database: process.env.PGDATABASE || "trimurl_db",
    ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false,
    max: parseInt(process.env.PGPOOL_SIZE || "20", 10),
    idleTimeoutMillis: parseInt(process.env.PGIDLE_TIMEOUT || "30000", 10),
    connectionTimeoutMillis: parseInt(process.env.PGCONNECTION_TIMEOUT || "5000", 10),
  };
};

module.exports = {
  dbConfig: parseDatabaseConfig(),
};
