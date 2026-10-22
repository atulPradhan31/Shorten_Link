require("dotenv").config();
const runAuthServiceTests = require("./unit/authService.test");
const runLinkServiceTests = require("./unit/linkService.test");
const runPostgresIntegrationTests = require("./integration/postgresRepositories.test");
const runConcurrencyTests = require("./integration/concurrency.test");
const { closePool } = require("../db/postgres");

const runAllTests = async () => {
  console.log("=================================================");
  console.log("🚀 Starting Full LinkShortener Test Suite");
  console.log("=================================================\n");

  let totalPassed = 0;
  let totalTests = 0;

  try {
    // 1. Unit Tests (Database-Agnostic with Memory Repositories)
    const authResults = await runAuthServiceTests();
    totalPassed += authResults.passed;
    totalTests += authResults.total;
    console.log();

    const linkResults = await runLinkServiceTests();
    totalPassed += linkResults.passed;
    totalTests += linkResults.total;
    console.log();

    // 2. Integration Tests (Live PostgreSQL Database)
    const pgResults = await runPostgresIntegrationTests();
    totalPassed += pgResults.passed;
    totalTests += pgResults.total;
    console.log();

    // 3. Concurrency Tests
    const concurrencyResults = await runConcurrencyTests();
    totalPassed += concurrencyResults.passed;
    totalTests += concurrencyResults.total;
    console.log();

    console.log("=================================================");
    console.log(
      `📊 Test Summary: ${totalPassed}/${totalTests} Passed (${Math.round(
        (totalPassed / totalTests) * 100
      )}%)`
    );
    console.log("=================================================");

    if (totalPassed === totalTests) {
      console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!\n");
      process.exit(0);
    } else {
      console.error("❌ SOME TESTS FAILED!\n");
      process.exit(1);
    }
  } catch (error) {
    console.error("Unexpected test execution failure:", error);
    process.exit(1);
  } finally {
    await closePool();
  }
};

runAllTests();
