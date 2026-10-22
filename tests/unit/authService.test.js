const assert = require("assert");
const AuthService = require("../../services/AuthService");
const MemoryUserRepository = require("../../repositories/memory/MemoryUserRepository");

const runAuthServiceTests = async () => {
  console.log("--- Running AuthService Unit Tests (Database-Agnostic) ---");
  let passed = 0;
  let total = 0;

  const test = (name, fn) => {
    total++;
    try {
      fn();
      console.log(`   ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`   ✗ ${name}: ${err.message}`);
    }
  };

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

  const userRepo = new MemoryUserRepository();
  const authService = new AuthService({
    userRepository: userRepo,
    config: { jwtSecret: "testSecretKey123" },
  });

  // 1. Successful Registration
  await testAsync("registers a new user and returns JWT token", async () => {
    const res = await authService.register({
      name: "Unit Tester",
      email: "tester@example.com",
      password: "password123",
    });
    assert.strictEqual(res.user.email, "tester@example.com");
    assert.ok(res.token && res.token.length > 20);
    assert.strictEqual(typeof res.user.password, "undefined"); // Credentials stripped
  });

  // 2. Reject Duplicate Email
  await testAsync("rejects registration with duplicate email", async () => {
    let threw = false;
    try {
      await authService.register({
        name: "Second Tester",
        email: "TESTER@example.com", // Case insensitive check
        password: "password123",
      });
    } catch (err) {
      threw = true;
      assert.strictEqual(err.statusCode, 400);
    }
    assert.ok(threw, "Expected error on duplicate registration");
  });

  // 3. Successful Login
  await testAsync("authenticates valid credentials and generates token", async () => {
    const res = await authService.login({
      email: "tester@example.com",
      password: "password123",
    });
    assert.strictEqual(res.user.email, "tester@example.com");
    assert.ok(res.token);
  });

  // 4. Reject Bad Password
  await testAsync("rejects invalid password with 401 Unauthorized", async () => {
    let threw = false;
    try {
      await authService.login({
        email: "tester@example.com",
        password: "wrongPassword!",
      });
    } catch (err) {
      threw = true;
      assert.strictEqual(err.statusCode, 401);
    }
    assert.ok(threw);
  });

  // 5. Session Verification
  let registeredUser = null;
  let activeToken = null;
  await testAsync("verifies active session token", async () => {
    const reg = await authService.register({
      name: "Session Tester",
      email: "session@example.com",
      password: "password123",
    });
    registeredUser = reg.user;
    activeToken = reg.token;

    const verified = await authService.verifySession(registeredUser.id, activeToken);
    assert.strictEqual(verified.id, registeredUser.id);
  });

  // 6. Session Logout
  await testAsync("revokes single token on logout", async () => {
    await authService.logout(registeredUser.id, activeToken);

    let threw = false;
    try {
      await authService.verifySession(registeredUser.id, activeToken);
    } catch (err) {
      threw = true;
      assert.strictEqual(err.statusCode, 401);
    }
    assert.ok(threw, "Revoked token should be rejected");
  });

  return { passed, total };
};

module.exports = runAuthServiceTests;

if (require.main === module) {
  runAuthServiceTests();
}
