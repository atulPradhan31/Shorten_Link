const axios = require("axios");

const API_URL = "http://localhost:3000/api/v1";
const BASE_URL = "http://localhost:3000";

const testUser = {
  name: "Standard Response Tester",
  email: `standard_tester_${Date.now()}@example.com`,
  password: "securePassword123!",
};

let token = "";
let linkId = "";
let shortId = "";
const customSlug = `std_${Date.now().toString().slice(-6)}`;

const runTests = async () => {
  let passed = 0;
  let total = 0;

  const test = (name, assertion) => {
    total++;
    if (assertion) {
      console.log(`   ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`   ❌ [FAIL] ${name}`);
    }
  };

  try {
    console.log("==========================================");
    console.log("Starting Full System Verification Suite...");
    console.log("==========================================\n");

    // 1. Healthcheck
    console.log("1. Testing Healthcheck Endpoint...");
    const health = await axios.get(`${BASE_URL}/api/health`);
    test("Healthcheck returns healthy", health.data.status === "healthy");

    // 2. Auth Protection - Verify 401 and standardized error envelope
    console.log("\n2. Testing Auth Security (No Token)...");
    try {
      await axios.get(`${API_URL}/links`);
      test("Protected route rejected unauthenticated request", false);
    } catch (err) {
      test(
        "Protected route rejected unauthenticated request with 401",
        err.response?.status === 401
      );
      test(
        "Error response contains success: false and error.code",
        err.response?.data?.success === false &&
          err.response?.data?.error?.code === "UNAUTHORIZED" &&
          typeof err.response?.data?.timestamp === "string"
      );
    }

    // 3. User Registration (Standardized envelope: success, message, data, token, timestamp)
    console.log("\n3. Testing User Registration...");
    const regRes = await axios.post(`${API_URL}/auth/register`, testUser);
    token = regRes.data.token || regRes.data.data?.token;
    test("User registration returned 201 Created", regRes.status === 201);
    test("Standardized envelope contains success: true", regRes.data.success === true);
    test("Standardized envelope contains data.user & data.token", !!regRes.data.data?.token);
    test("Received valid JWT token", typeof token === "string" && token.length > 20);

    // 4. User Login
    console.log("\n4. Testing User Login...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    test("User login returned 200 OK", loginRes.status === 200);
    test("Login response contains data.token and message", !!loginRes.data.data?.token && !!loginRes.data.message);

    // 5. Create Link with Auto-generated ID (Standardized envelope)
    console.log("\n5. Testing Link Creation (Auto-Generated ID)...");
    const createRes = await axios.post(
      `${API_URL}/links`,
      { originalUrl: "https://www.google.com" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    test("Link created with status 201", createRes.status === 201);
    test("Standardized envelope contains data.urlId", createRes.data.data?.urlId?.length === 7);
    test("Backward-compatible link alias is present", createRes.data.link?.urlId?.length === 7);
    linkId = createRes.data.data?.id || createRes.data.link?._id;
    shortId = createRes.data.data?.urlId || createRes.data.link?.urlId;

    // 6. Create Link with Custom Alias
    console.log("\n6. Testing Link Creation (Custom Alias)...");
    const customRes = await axios.post(
      `${API_URL}/links`,
      {
        originalUrl: "https://github.com",
        shortLink: customSlug,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    test("Link created with custom alias", customRes.data.data?.urlId === customSlug);

    // 7. Test Duplicate Custom Alias Rejection (Standardized error envelope)
    console.log("\n7. Testing Duplicate Alias Rejection...");
    try {
      await axios.post(
        `${API_URL}/links`,
        {
          originalUrl: "https://github.com",
          shortLink: customSlug,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      test("Duplicate alias rejected", false);
    } catch (err) {
      test("Duplicate alias rejected with 400 Bad Request", err.response?.status === 400);
      test(
        "Standardized error contains code: BAD_REQUEST",
        err.response?.data?.error?.code === "BAD_REQUEST"
      );
    }

    // 8. Fetch All User Links (Standardized list: data array, meta.count)
    console.log("\n8. Testing Fetch All User Links...");
    const getAllRes = await axios.get(`${API_URL}/links`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    test("Fetch links returned success: true", getAllRes.data.success === true);
    test("Standardized data is an Array", Array.isArray(getAllRes.data.data) && getAllRes.data.data.length >= 2);
    test("Standardized meta.count matches", getAllRes.data.meta?.count >= 2);
    test("Legacy links array matches", Array.isArray(getAllRes.data.links));

    // 9. Fetch Single Link
    console.log("\n9. Testing Fetch Single Link...");
    const getSingleRes = await axios.get(`${API_URL}/links/${linkId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    test("Fetch single link matched ID in data", (getSingleRes.data.data?.id || getSingleRes.data.data?._id) === linkId);
    const initialClicks = getSingleRes.data.data?.click ?? getSingleRes.data.link?.click;
    test("Fetching link did NOT increment clicks", initialClicks === 0);

    // 10. Public Redirect & Atomic Click Increment (HTTP 302 non-JSON redirect)
    console.log("\n10. Testing Public Redirection & Atomic Click Counting...");
    try {
      await axios.get(`${BASE_URL}/${shortId}`, {
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
      });
    } catch (err) {
      // Axios may follow redirect or throw on 302
    }

    const verifyClickRes = await axios.get(`${API_URL}/links/${linkId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const finalClicks = verifyClickRes.data.data?.click ?? verifyClickRes.data.link?.click;
    test("Public redirection atomically incremented click count to 1", finalClicks === 1);

    // 11. Update Link
    console.log("\n11. Testing Link Update...");
    const updateRes = await axios.patch(
      `${API_URL}/links/${linkId}`,
      { originalUrl: "https://wikipedia.org" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    test(
      "Link destination updated successfully in data",
      (updateRes.data.data?.originalUrl || updateRes.data.link?.originalUrl) === "https://wikipedia.org"
    );

    // 12. Delete Link
    console.log("\n12. Testing Link Deletion...");
    const deleteRes = await axios.delete(`${API_URL}/links/${linkId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    test("Link deleted successfully", deleteRes.data.success === true);
    test("Delete response has confirmation message", typeof deleteRes.data.message === "string");

    // 13. Verify Deletion
    try {
      await axios.get(`${API_URL}/links/${linkId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      test("Deleted link cannot be fetched", false);
    } catch (err) {
      test("Deleted link returned 404 Not Found", err.response?.status === 404);
      test(
        "Standardized 404 error code is NOT_FOUND",
        err.response?.data?.error?.code === "NOT_FOUND"
      );
    }

    // 14. Single Session Logout
    console.log("\n14. Testing Session Logout...");
    const logoutRes = await axios.get(`${API_URL}/auth/logout`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    test("Logout returned success", logoutRes.data.success === true);

    // 15. Verify Token Revocation
    try {
      await axios.get(`${API_URL}/links`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      test("Revoked token rejected", false);
    } catch (err) {
      test("Revoked token rejected with 401 Unauthorized", err.response?.status === 401);
    }

    console.log("\n==========================================");
    console.log(`Results: ${passed}/${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
    console.log("==========================================");
  } catch (error) {
    console.error("Verification suite failed unexpectedly:", error.message);
  }
};

runTests();
