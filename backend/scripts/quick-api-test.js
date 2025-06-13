/**
 * Simple API Test Script
 *
 * Tests the core API endpoints of the EMS system
 */

import axios from "axios";

const API_URL = "http://localhost:3000/api";

console.log("=== EMS API TEST ===");
console.log("Testing connection to API server...");

// Create a random test user
const testUser = {
  name: "Test User",
  email: `testuser${Math.floor(Math.random() * 10000)}@example.com`,
  password: "Password123!",
};

// Test employee data
const testEmployee = {
  name: "Test Employee",
  email: `employee${Math.floor(Math.random() * 10000)}@example.com`,
  position: "Developer",
  department: "Engineering",
  salary: 75000,
};

async function runTest() {
  try {
    console.log(`\n1. Testing Server Connection`);
    const response = await axios.get(`${API_URL}/users/me`, {
      validateStatus: () => true,
    });
    console.log(`✓ Server is responding (status ${response.status})`);

    console.log(`\n2. Testing User Registration`);
    const signupResult = await axios.post(`${API_URL}/users/signup`, testUser);

    if (signupResult.data.success) {
      console.log(`✓ User registration successful`);
      console.log(`- User ID: ${signupResult.data.user.id}`);
      console.log(`- Email: ${signupResult.data.user.email}`);
    } else {
      console.log(`✗ User registration failed: ${signupResult.data.message}`);
    }

    console.log(`\n3. Testing User Login`);
    const loginResult = await axios.post(`${API_URL}/users/login`, {
      email: testUser.email,
      password: testUser.password,
    });

    let authToken = "";

    if (loginResult.data.success) {
      console.log(`✓ User login successful`);
      authToken = loginResult.data.token;
      console.log(`- Auth token received`);
    } else {
      console.log(`✗ User login failed: ${loginResult.data.message}`);
    }

    console.log(`\n4. Testing Protected Route (Get Current User)`);
    const userResult = await axios.get(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (userResult.data.success) {
      console.log(`✓ Protected route access successful`);
      console.log(`- User name: ${userResult.data.user.name}`);
      console.log(`- User email: ${userResult.data.user.email}`);
    } else {
      console.log(`✗ Protected route access failed`);
    }

    console.log(`\n5. Testing Employee Creation`);
    const employeeResult = await axios.post(
      `${API_URL}/employees`,
      testEmployee,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        validateStatus: () => true,
      }
    );

    if (employeeResult.status === 201 || employeeResult.status === 200) {
      console.log(`✓ Employee creation successful`);
      console.log(
        `- Employee ID: ${
          employeeResult.data.id || employeeResult.data.employee.id
        }`
      );
    } else {
      console.log(`✗ Employee creation failed: ${employeeResult.status}`);
      console.log(`- This is expected if your test user is not an admin`);
    }

    console.log(`\n6. Testing Employee Listing`);
    const employeesResult = await axios.get(`${API_URL}/employees`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (employeesResult.data.success || Array.isArray(employeesResult.data)) {
      const employees = Array.isArray(employeesResult.data)
        ? employeesResult.data
        : employeesResult.data.employees;

      console.log(`✓ Employee listing successful`);
      console.log(`- Total employees: ${employees.length}`);
    } else {
      console.log(`✗ Employee listing failed`);
    }

    console.log(`\n✓ All basic API tests complete!`);
  } catch (error) {
    console.error(`\n✗ ERROR: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
  }
}

runTest();
