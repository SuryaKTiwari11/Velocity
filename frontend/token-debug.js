/**
 * Token Debug Script
 *
 * This script helps verify a JWT token for debugging purposes
 */

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// A sample token - replace this with a token from your login response
const token = "PASTE_YOUR_TOKEN_HERE";

try {
  // Try to decode the token with the secret
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  console.log("✅ Token is valid!");
  console.log("Payload:", decoded);

  // Check for common issues
  if (!decoded.userID) {
    console.log("⚠️ Warning: Token does not contain userID field");
  }

  // Check expiration
  if (decoded.exp) {
    const expDate = new Date(decoded.exp * 1000);
    console.log(`Token expires at: ${expDate.toLocaleString()}`);

    if (expDate < new Date()) {
      console.log("⚠️ Warning: Token has already expired!");
    }
  }
} catch (error) {
  console.log("❌ Token validation failed:", error.message);

  if (error.name === "JsonWebTokenError") {
    console.log(
      "This usually means the token is malformed or the signature is invalid"
    );
    console.log(
      "Make sure your JWT_SECRET in the .env file matches the one used to create the token"
    );
  }

  if (error.name === "TokenExpiredError") {
    console.log(
      "The token has expired. Generate a new one by logging in again."
    );
  }
}
