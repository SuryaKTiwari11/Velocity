/**
 * EMS API Test Script
 *
 * Comprehensive test script for the EMS backend API
 * Uses email as the relationship key between User and Employee models
 */

import axios from "axios";

const API_URL = "http://localhost:3000/api";

// Console styling for better readability
const styles = {
  header: (text) => console.log(`\n===== ${text} =====\n`),
  success: (text) => console.log(`✅ ${text}`),
  error: (text) => console.log(`❌ ${text}`),
  info: (text) => console.log(`ℹ️  ${text}`),
};

// Generate unique test data to avoid conflicts
const randomId = Math.floor(Math.random() * 10000);
const testUser = {
  name: "Test User",
  email: `testuser${randomId}@example.com`,
  password: "Password123!",
};

// Use SAME EMAIL to link employee with user - this is key for your relationship
const testEmployee = {
  name: testUser.name,
  email: testUser.email, // Same email creates the relationship
  position: "Developer",
  department: "Engineering",
  salary: 75000,
};

// Functions to debug API requests
const debugRequest = (config) => {
  console.log(
    `\n🔍 DEBUG REQUEST: ${config.method.toUpperCase()} ${config.url}`
  );
  if (config.headers?.Authorization) {
    console.log(`🔑 Auth: ${config.headers.Authorization.substring(0, 20)}...`);
  }
  return config;
};

const debugResponse = (response) => {
  console.log(
    `🔍 DEBUG RESPONSE: ${response.status} from ${response.config.url}`
  );
  return response;
};

// Create axios instance with error handling and debugging
const api = axios.create({
  baseURL: API_URL,
  validateStatus: () => true, // Don't throw errors for non-200 responses
  withCredentials: true, // Include cookies
});

async function runTests() {
  let authToken = "";
  styles.header("EMS API TEST");
  styles.info(`Testing API at ${API_URL}`);
  styles.info(`Test user email: ${testUser.email}`);

  // Set up request and response interceptors for debugging
  api.interceptors.request.use(debugRequest);
  api.interceptors.response.use(debugResponse);

  try {
    // 1. Test server connection
    styles.header("SERVER CONNECTION");
    const connectResponse = await api.get("/users/me");
    styles.success(`Server is responding (Status: ${connectResponse.status})`);

    // 2. Register new user
    styles.header("USER REGISTRATION");
    const signupResponse = await api.post("/users/signup", testUser);

    if (signupResponse.data.success) {
      styles.success("User registration successful");
      styles.info(`User ID: ${signupResponse.data.user.id}`);
    } else if (signupResponse.data.error?.includes("already exists")) {
      styles.error("User already exists");
      styles.info("Continuing with login...");
    } else {
      styles.error(
        `Registration failed: ${
          signupResponse.data.error || signupResponse.statusText
        }`
      );
      if (signupResponse.data.error?.includes("employeeInfoId")) {
        styles.info(
          "The error is related to employeeInfoId - make sure your models don't reference this column"
        );
      }
    }

    // 3. Login
    styles.header("USER LOGIN");
    const loginResponse = await api.post("/users/login", {
      email: testUser.email,
      password: testUser.password,
    });

    if (loginResponse.data.success) {
      styles.success("Login successful");
      // Check for authentication tokens/cookies
      if (loginResponse.data.token) {
        authToken = loginResponse.data.token;
        styles.info(`JWT token received: ${authToken.substring(0, 15)}...`);
      }

      if (loginResponse.headers["set-cookie"]) {
        styles.info("Authentication cookie received");
      }
    } else {
      styles.error(
        `Login failed: ${loginResponse.data.error || loginResponse.statusText}`
      );
    }
    // 4. Get current user (protected route)
    styles.header("CURRENT USER");
    const userResponse = await api.get("/users/me", {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });

    if (userResponse.data.success) {
      styles.success("Current user retrieved successfully");
      styles.info(`Name: ${userResponse.data.user.name}`);
      styles.info(`Email: ${userResponse.data.user.email}`);

      // Check if employee info is returned too
      if (userResponse.data.employeeInfo) {
        styles.success("Employee information linked by email found!");
        styles.info(`Position: ${userResponse.data.employeeInfo.position}`);
        styles.info(`Department: ${userResponse.data.employeeInfo.department}`);
      }
    } else {
      styles.error(
        `Get current user failed: ${
          userResponse.data.message ||
          userResponse.data.error ||
          userResponse.statusText
        }`
      );
      styles.info(`Status code: ${userResponse.status}`);
      styles.info(
        `Make sure the token is being handled correctly in your auth middleware`
      );
    }
    // 5. Employee operations
    styles.header("EMPLOYEE OPERATIONS");

    // If employee doesn't already exist with the user, create one
    const createResponse = await api.post("/employees", testEmployee, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (createResponse.data.success) {
      styles.success("Employee creation successful");

      // Extract employee ID from the response
      const employeeId =
        createResponse.data.data?.id ||
        createResponse.data.employee?.id ||
        createResponse.data.id;

      styles.info(`Employee ID: ${employeeId}`);

      // List all employees
      const listResponse = await api.get("/employees", {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });

      if (listResponse.data.success || Array.isArray(listResponse.data)) {
        const employees = Array.isArray(listResponse.data)
          ? listResponse.data
          : listResponse.data.employees || [];

        styles.success("Employee listing successful");
        styles.info(`Total employees: ${employees.length}`);
      } else {
        styles.error(
          `Employee listing failed: ${
            listResponse.data.error || listResponse.statusText
          }`
        );
      }
    } else if (createResponse.status === 401) {
      styles.error("Employee creation failed: Not authorized");
      styles.info("This is expected if your test user is not an admin");
    } else {
      styles.error(
        `Employee creation failed: ${
          createResponse.data.error || createResponse.statusText
        }`
      );
    }

    // 6. Password reset flow
    styles.header("PASSWORD RESET");
    const forgotResponse = await api.post("/users/forgot-password", {
      email: testUser.email,
    });

    if (forgotResponse.data.success) {
      styles.success("Password reset request successful");
      styles.info("Check email or logs for OTP code");
    } else {
      styles.error(
        `Password reset failed: ${
          forgotResponse.data.error || forgotResponse.statusText
        }`
      );
    }

    // 7. Logout
    styles.header("LOGOUT");
    const logoutResponse = await api.post(
      "/users/logout",
      {},
      {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      }
    );

    if (logoutResponse.data.success) {
      styles.success("Logout successful");
    } else {
      styles.error(
        `Logout failed: ${
          logoutResponse.data.error || logoutResponse.statusText
        }`
      );
    }

    // Test summary
    styles.header("TEST SUMMARY");
    styles.success("All tests completed!");
    styles.info(
      "Some tests might have failed depending on your server configuration"
    );
    styles.info("Check the output above for detailed results");
  } catch (error) {
    styles.error(`Test execution error: ${error.message}`);
  }
}

// Run tests
runTests();
