const assert = require("assert");
const PostgresUserRepository = require("../../repositories/postgres/PostgresUserRepository");
const PostgresLinkRepository = require("../../repositories/postgres/PostgresLinkRepository");
const { query } = require("../../db/postgres");

const runConcurrencyTests = async () => {
  console.log("--- Running Concurrency & Atomic Click Counter Tests ---");
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

  const testEmail = `concurrency_${Date.now()}@test.com`;
  const testUrlId = `cc_${Date.now().toString().slice(-6)}`;
  let userId = "";
  let linkId = "";

  const user = await userRepo.create({
    name: "Concurrency Tester",
    email: testEmail,
    password: "password123",
  });
  userId = user.id;

  const link = await linkRepo.create({
    userId,
    originalUrl: "https://example.org",
    urlId: testUrlId,
    click: 0,
  });
  linkId = link.id;

  // Test 50 concurrent increments
  await testAsync("executes 50 concurrent click increments without lost updates", async () => {
    const NUM_REQUESTS = 50;
    const promises = [];

    for (let i = 0; i < NUM_REQUESTS; i++) {
      promises.push(linkRepo.incrementClickCount(testUrlId));
    }

    await Promise.all(promises);

    const finalLink = await linkRepo.findByUrlId(testUrlId);
    assert.strictEqual(
      finalLink.click,
      NUM_REQUESTS,
      `Expected click count to be exactly ${NUM_REQUESTS}, but got ${finalLink.click}`
    );
  });

  // Cleanup
  try {
    await linkRepo.delete(linkId, userId);
    await query("DELETE FROM users WHERE id = $1;", [userId]);
  } catch (err) {
    // Ignore cleanup
  }

  return { passed, total };
};

module.exports = runConcurrencyTests;

if (require.main === module) {
  runConcurrencyTests();
}
