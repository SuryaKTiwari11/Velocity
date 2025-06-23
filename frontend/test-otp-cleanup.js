import axios from "axios";

const BASE_URL = "http://localhost:3000/api";
const TEST_ADMIN_EMAIL = "admin@example.com";
const TEST_ADMIN_PASSWORD = "adminpassword";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

async function testOTPCleanup() {
  try {
    console.log("Testing OTP cleanup admin API...");

    // Step 1: Login as admin
    console.log("Logging in as admin...");
    const loginRes = await api.post("/users/login", {
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD,
    });

    if (!loginRes.data.success) {
      console.error("Admin login failed:", loginRes.data);
      return;
    }

    // Get token
    const token = loginRes.data.token;

    // Set auth header
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Step 2: Call the cleanup endpoint
    console.log("Triggering OTP cleanup...");
    const cleanupRes = await api.post("/otp/admin/cleanup");

    console.log("OTP Cleanup Results:");
    console.log(cleanupRes.data);

    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Error during test:", error.response?.data || error.message);
  }
}

testOTPCleanup();
