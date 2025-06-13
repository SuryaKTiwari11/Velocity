/**
 * Debug script for the authentication middleware
 *
 * This script tests the JWT verification directly
 */

import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
configDotenv();

// The key loaded from environment variables
const key = process.env.JWT_SECRET;

console.log("=== JWT DEBUG SCRIPT ===");
console.log(`JWT_SECRET: ${key ? "Successfully loaded" : "MISSING!"}`);

// Function to test JWT verification directly
function testJwt(token) {
  console.log(`\nTesting token: ${token.substring(0, 15)}...`);

  try {
    // Try to verify the token using the secret key
    const decoded = jwt.verify(token, key);

    console.log("✅ Token verification successful!");
    console.log("Decoded payload:", decoded);

    if (decoded.userID) {
      console.log(`✅ userID found in token: ${decoded.userID}`);
    } else {
      console.log("❌ No userID found in token");
    }
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    console.error("Error type:", error.name);

    // Check for specific errors
    if (error.name === "JsonWebTokenError") {
      console.log("This usually means the token signature is invalid.");
      console.log(
        "Make sure the JWT_SECRET is the same used to sign the token."
      );
    }

    if (error.name === "TokenExpiredError") {
      console.log(
        "The token has expired. Generate a new one by logging in again."
      );
    }
  }
}

// Generate a test token to verify signature works
function generateTestToken() {
  console.log("\n=== GENERATING TEST TOKEN ===");

  try {
    const testPayload = { userID: "test-user-123", testField: true };
    const testToken = jwt.sign(testPayload, key, { expiresIn: "1h" });

    console.log(`✅ Test token generated: ${testToken.substring(0, 20)}...`);

    // Verify the test token
    console.log("\n=== VERIFYING TEST TOKEN ===");
    testJwt(testToken);
  } catch (error) {
    console.error("❌ Failed to generate test token:", error.message);
  }
}

// Run the tests
generateTestToken();

// If you have a real token to test, uncomment this line and paste your token:
// testJwt("YOUR_TOKEN_HERE");
