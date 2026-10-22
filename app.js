require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");
const app = express();

const { checkConnection, closePool } = require("./db/postgres");
const { runMigrations } = require("./migrations/runner");
const errorHandlerMiddleware = require("./middleware/error-handler");
const notFoundMiddleware = require("./middleware/not-found");

// Routers
const authRouter = require("./routes/authRouter");
const linkRouter = require("./routes/linkRouter");
const publicRouter = require("./routes/publicRouter");

// Middleware
app.use(
  cors({
    origin: "*", // Allow cross-origin requests from frontend development & production
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Health Check
app.get("/api/health", async (req, res) => {
  const isDbHealthy = await checkConnection();
  res.status(isDbHealthy ? 200 : 503).json({
    status: isDbHealthy ? "healthy" : "degraded",
    database: isDbHealthy ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// API Routes (Mounted first to avoid collision with root public redirects)
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/links", linkRouter);

// Public Root Redirects (Mounted after API routes)
app.use("/", publicRouter);

// Error Handling
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

let server = null;

const start = async () => {
  try {
    const isDbConnected = await checkConnection();
    if (!isDbConnected) {
      throw new Error("Could not connect to PostgreSQL database. Please check configuration.");
    }
    console.log("PostgreSQL database connected successfully");

    // Automatically apply pending migrations on boot
    await runMigrations();

    server = app.listen(port, () => console.log(`Server is running at http://localhost:${port}`));
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

// Graceful shutdown handling
const shutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down server gracefully...`);
  if (server) {
    server.close(async () => {
      console.log("HTTP server closed");
      await closePool();
      process.exit(0);
    });
  } else {
    await closePool();
    process.exit(0);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

if (require.main === module) {
  start();
}

module.exports = app;
