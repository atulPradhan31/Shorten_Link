const assert = require("assert");
const LinkService = require("../../services/LinkService");
const MemoryLinkRepository = require("../../repositories/memory/MemoryLinkRepository");

const runLinkServiceTests = async () => {
  console.log("--- Running LinkService Unit Tests (Database-Agnostic) ---");
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

  const linkRepo = new MemoryLinkRepository();
  const linkService = new LinkService({ linkRepository: linkRepo });
  const userId = "user-123";

  // 1. Create with auto-generated ID
  let autoLink = null;
  await testAsync("creates a link with 7-char randomized ID", async () => {
    autoLink = await linkService.createLink(userId, {
      originalUrl: "https://google.com",
    });
    assert.strictEqual(autoLink.originalUrl, "https://google.com");
    assert.strictEqual(autoLink.urlId.length, 7);
    assert.strictEqual(autoLink.click, 0);
  });

  // 2. Create with custom alias
  await testAsync("creates a link with custom alias", async () => {
    const customLink = await linkService.createLink(userId, {
      originalUrl: "https://github.com",
      urlId: "my-gh-link",
    });
    assert.strictEqual(customLink.urlId, "my-gh-link");
  });

  // 3. Reject reserved slug
  await testAsync("rejects reserved keywords as custom aliases", async () => {
    let threw = false;
    try {
      await linkService.createLink(userId, {
        originalUrl: "https://example.com",
        urlId: "api",
      });
    } catch (err) {
      threw = true;
      assert.strictEqual(err.statusCode, 400);
      assert.ok(err.message.includes("reserved keyword"));
    }
    assert.ok(threw);
  });

  // 4. Reject duplicate alias
  await testAsync("rejects duplicate custom aliases", async () => {
    let threw = false;
    try {
      await linkService.createLink(userId, {
        originalUrl: "https://wikipedia.org",
        urlId: "my-gh-link", // Already used
      });
    } catch (err) {
      threw = true;
      assert.strictEqual(err.statusCode, 400);
      assert.ok(err.message.includes("already in use"));
    }
    assert.ok(threw);
  });

  // 5. Atomic click counter increment
  await testAsync("increments click count atomically on resolution", async () => {
    const resolved = await linkService.resolveAndIncrementClick(autoLink.urlId);
    assert.strictEqual(resolved.destination, "https://google.com");
    assert.strictEqual(resolved.link.click, 1);
  });

  // 6. User ownership enforcement on delete
  await testAsync("prevents non-owners from deleting other users' links", async () => {
    let threw = false;
    try {
      await linkService.deleteLink(autoLink.id, "different-user-456");
    } catch (err) {
      threw = true;
      assert.strictEqual(err.statusCode, 404);
    }
    assert.ok(threw);
  });

  return { passed, total };
};

module.exports = runLinkServiceTests;

if (require.main === module) {
  runLinkServiceTests();
}
