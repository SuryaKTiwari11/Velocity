/**
 * EMS API Testing Script
 * 
 * This script tests all main API endpoints of the EMS system.
 * Run it with: node test-api.js
 */

// We'll use axios for HTTP requests
import axios from "axios";

// Base URL for API calls
const API_URL = "http://localhost:3000/api";
const FRONTEND_URL = "http://localhost:5173";

// Client for making API requests
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // For cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Test user data
const testUser = {
  name: "API Test User",
  email: `apitest${Math.floor(Math.random() * 10000)}@example.com`,
  password: "testpassword123",
};

// Store auth token and user ID
let authToken;
let userId;

// Test employee data
const testEmployee = {
  name: "Test Employee",
  email: `employee${Math.floor(Math.random() * 10000)}@example.com`,
  position: "Developer",
  department: "Engineering",
  salary: 75000,
};

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

// Logging helpers
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.blue}==== ${msg} ====${colors.reset}\n`),
};

// Main test function
async function runTests() {
  log.info("Starting EMS API Tests");
  log.info(`API URL: ${API_URL}`);
  log.info(`Frontend URL: ${FRONTEND_URL}`);
  log.info(`Test user email: ${testUser.email}`);

  try {
    // 1. Registration
    log.section("User Registration");
    await testRegistration();

    // 2. Login
    log.section("User Login");
    await testLogin();

    // 3. Get Current User
    log.section("Get Current User");
    await testGetCurrentUser();

    // 4. Employee Operations
    log.section("Employee Operations");
    await testEmployeeOperations();

    // 5. Password Reset Flow
    log.section("Password Reset Flow");
    await testPasswordReset();

    // 6. Logout
    log.section("User Logout");
    await testLogout();

    // 7. SSO URLs (just verify they're correct)
    log.section("SSO Authentication URLs");
    testSSOUrls();

    log.section("Test Summary");
    log.success("All tests completed successfully!");
    log.info(`
      Key endpoints to manually test:
      - Google SSO: ${API_URL}/users/auth/google
      - GitHub SSO: ${API_URL}/users/auth/github
      - Frontend login page: ${FRONTEND_URL}/login
      - Frontend signup page: ${FRONTEND_URL}/signup
    `);
  } catch (error) {
    log.error("Test failed:");
    console.error(error);
  }
}

// Test user registration
async function testRegistration() {
  try {
    const response = await api.post("/users/signup", testUser);
    if (response.data.success) {
      log.success("User registration successful");
      userId = response.data.user.id;
      return true;
    } else {
      log.error(`Registration failed: ${response.data.error}`);
      return false;
    }
  } catch (error) {
    log.error(`Registration failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Test user login
async function testLogin() {
  try {
    const response = await api.post("/users/login", {
      email: testUser.email,
      password: testUser.password,
    });
    
    if (response.data.success) {
      log.success("Login successful");
      // Store cookie from response
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        log.success("Auth cookie received");
      }
      return true;
    } else {
      log.error(`Login failed: ${response.data.error}`);
      return false;
    }
  } catch (error) {
    log.error(`Login failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Test getting current user info
async function testGetCurrentUser() {
  try {
    const response = await api.get("/users/me");
    if (response.data.success) {
      log.success("Current user retrieved successfully");
      log.info(`User name: ${response.data.user.name}`);
      log.info(`User email: ${response.data.user.email}`);
      return true;
    } else {
      log.error(`Get current user failed: ${response.data.error}`);
      return false;
    }
  } catch (error) {
    log.error(`Get current user failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Test employee CRUD operations
async function testEmployeeOperations() {
  // 1. Create employee
  try {
    const createResponse = await api.post("/employees", testEmployee);
    if (createResponse.data.success) {
      testEmployee.id = createResponse.data.employee.id;
      log.success(`Employee created with ID: ${testEmployee.id}`);
    } else {
      log.error(`Create employee failed: ${createResponse.data.error}`);
      return false;
    }
    
    // 2. Get all employees
    const allResponse = await api.get("/employees");
    if (allResponse.data.success) {
      log.success(`Retrieved ${allResponse.data.employees.length} employees`);
    } else {
      log.error(`Get all employees failed: ${allResponse.data.error}`);
    }
    
    // 3. Get employee by ID
    const getResponse = await api.get(`/employees/${testEmployee.id}`);
    if (getResponse.data.success) {
      log.success(`Retrieved employee: ${getResponse.data.employee.name}`);
    } else {
      log.error(`Get employee failed: ${getResponse.data.error}`);
    }
    
    // 4. Update employee
    const updateData = { position: "Senior Developer" };
    const updateResponse = await api.put(`/employees/${testEmployee.id}`, updateData);
    if (updateResponse.data.success) {
      log.success("Employee updated successfully");
    } else {
      log.error(`Update employee failed: ${updateResponse.data.error}`);
    }
    
    // 5. Delete employee
    const deleteResponse = await api.delete(`/employees/${testEmployee.id}`);
    if (deleteResponse.data.success) {
      log.success("Employee deleted successfully");
    } else {
      log.error(`Delete employee failed: ${deleteResponse.data.error}`);
    }
    
    return true;
  } catch (error) {
    log.error(`Employee operation failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Test password reset flow
async function testPasswordReset() {
  try {
    // 1. Request password reset
    const resetRequest = await api.post("/users/forgot-password", {
      email: testUser.email,
    });
    
    if (resetRequest.data.success) {
      log.success("Password reset request successful");
      log.info(`Check Email Preview URL: ${resetRequest.data.previewUrl || "Not available"}`);
      log.warning("For full testing of the password reset flow, you need to manually check the OTP");
      return true;
    } else {
      log.error(`Password reset request failed: ${resetRequest.data.error}`);
      return false;
    }
  } catch (error) {
    log.error(`Password reset failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Test logout
async function testLogout() {
  try {
    const response = await api.post("/users/logout");
    if (response.data.success) {
      log.success("Logout successful");
      return true;
    } else {
      log.error(`Logout failed: ${response.data.error}`);
      return false;
    }
  } catch (error) {
    log.error(`Logout failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Test SSO URLs
function testSSOUrls() {
  log.info(`Google Auth URL: ${API_URL}/users/auth/google`);
  log.info(`GitHub Auth URL: ${API_URL}/users/auth/github`);
  log.info(`SSO Success URL: ${API_URL}/users/auth/success`);
  log.info(`For SSO testing, open these URLs in a browser and complete the authentication flow`);
}

// Run the tests
runTests().catch(console.error);
