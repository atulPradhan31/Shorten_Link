const assert = require("assert");
const PostgresUserRepository = require("../../repositories/postgres/PostgresUserRepository");
const PostgresLinkRepository = require("../../repositories/postgres/PostgresLinkRepository");
const { withTransaction, query } = require("../../db/postgres");
const CustomError = require("../../errors/custom-error");

const runPostgresIntegrationTests = async () => {
  console.log("--- Running PostgreSQL Repositories Integration Tests ---");
  let passed = 0;
  let total = 0;

  const testAsync = async (name, fn) => {
    total++;
    try {
      await fn();
      console.log(`   ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`   ✗ ${name}: ${err.message}`);
    }
  };

  const userRepo = new PostgresUserRepository();
  const linkRepo = new PostgresLinkRepository();

  const testEmail = `integration_${Date.now()}@test.com`;
  let userId = "";
  let linkId = "";
  const testUrlId = `pg_${Date.now().toString().slice(-6)}`;

  // 1. User Creation in PostgreSQL
  await testAsync("creates a user record in PostgreSQL", async () => {
    const user = await userRepo.create({
      name: "PG Integration User",
      email: testEmail,
      password: "hashedPassword123",
    });
    assert.ok(user.id);
    assert.strictEqual(user.email, testEmail);
    userId = user.id;
  });

  // 2. Fetch User by Email and ID
  await testAsync("finds user by email (case-insensitive)", async () => {
    const found = await userRepo.findByEmail(testEmail.toUpperCase());
    assert.ok(found);
    assert.strictEqual(found.id, userId);
  });

  // 3. User Session Token Management
  await testAsync("adds, checks, and removes user session tokens", async () => {
    const token = "mock-jwt-token-12345";
    await userRepo.addToken(userId, token);
    const hasToken = await userRepo.hasToken(userId, token);
    assert.strictEqual(hasToken, true);

    await userRepo.removeToken(userId, token);
    const hasTokenAfter = await userRepo.hasToken(userId, token);
    assert.strictEqual(hasTokenAfter, false);
  });

  // 4. Link Creation in PostgreSQL
  await testAsync("creates a link record in PostgreSQL", async () => {
    const link = await linkRepo.create({
      userId,
      originalUrl: "https://postgresql.org",
      urlId: testUrlId,
      click: 0,
    });
    assert.ok(link.id);
    assert.strictEqual(link.urlId, testUrlId);
    assert.strictEqual(link.click, 0);
    linkId = link.id;
  });

  // 5. Atomic Click Increment in PostgreSQL
  await testAsync("atomically increments click count", async () => {
    const updated = await linkRepo.incrementClickCount(testUrlId);
    assert.ok(updated);
    assert.strictEqual(updated.click, 1);

    const updatedAgain = await linkRepo.incrementClickCount(testUrlId);
    assert.strictEqual(updatedAgain.click, 2);
  });

  // 6. User Links Pagination
  await testAsync("fetches user links with pagination options", async () => {
    const links = await linkRepo.findUserUrls(userId, { limit: 10, offset: 0 });
    assert.ok(Array.isArray(links));
    assert.ok(links.length >= 1);
    assert.strictEqual(links[0].userId, userId);
  });

  // 7. Transaction Rollback Verification
  await testAsync("rolls back database transaction on error", async () => {
    const rollbackUrlId = `rb_${Date.now()}`;
    let threw = false;

    try {
      await withTransaction(async (client) => {
        await client.query(
          "INSERT INTO links (user_id, original_url, url_id, click) VALUES ($1, $2, $3, 0);",
          [userId, "https://rollback-test.com", rollbackUrlId]
        );
        throw new Error("Intentional transaction failure");
      });
    } catch (err) {
      threw = true;
    }

    assert.ok(threw, "Transaction was expected to throw");
    const check = await linkRepo.findByUrlId(rollbackUrlId);
    assert.strictEqual(check, null, "Rolled-back record must not exist in database");
  });

  // 8. Database Error Translation (Unique Constraint Violation)
  await testAsync("translates PostgreSQL unique violation into CustomError 400", async () => {
    let threw = false;
    try {
      await userRepo.create({
        name: "Duplicate User",
        email: testEmail, // Already exists
        password: "hashedPassword123",
      });
    } catch (err) {
      threw = true;
      assert.ok(err instanceof CustomError);
      assert.strictEqual(err.statusCode, 400);
      assert.ok(err.message.includes("already exists"));
    }
    assert.ok(threw, "Unique violation should be intercepted and translated");
  });

  // Cleanup test user and links
  try {
    await linkRepo.delete(linkId, userId);
    await query("DELETE FROM users WHERE id = $1;", [userId]);
  } catch (err) {
    // Ignore cleanup error
  }

  return { passed, total };
};

module.exports = runPostgresIntegrationTests;

if (require.main === module) {
  runPostgresIntegrationTests();
}
