import jwt from "jsonwebtoken";
import { User } from "../model/index.js";
import { configDotenv } from "dotenv";
configDotenv();
const key = process.env.JWT_SECRET;

export const protectedRoute = async (req, res, next) => {
  try {
    // Enhanced debugging
    console.log("\n=== AUTH MIDDLEWARE DEBUG ===");
    console.log("Headers received:", JSON.stringify(req.headers, null, 2));
    console.log(
      "Authorization header:",
      req.headers.authorization || "Not present"
    );
    console.log(
      "Cookies:",
      req.cookies ? JSON.stringify(req.cookies) : "No cookies"
    );

    // Check for token in Authorization header first (preferred method)
    let token;
    if (req.headers.authorization) {
      console.log("Using Authorization header token");
      // Better handling of Bearer token format
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove "Bearer " prefix
      } else {
        token = authHeader; // Use as-is if no Bearer prefix
      }
      console.log(
        "Token from Authorization header:",
        token ? "Found" : "Empty"
      );
    }

    // If no token in Authorization header, fall back to cookies
    if (!token && req.cookies?.jwt) {
      console.log("Using token from cookie");
      token = req.cookies.jwt;
    }

    if (!token) {
      console.log("No token found in headers or cookies");
      return res
        .status(401)
        .json({ success: false, message: "Authentication token not found" });
    }

    console.log("Token found, verifying...");
    let decoded;
    try {
      decoded = jwt.verify(token, key);
    } catch (jwtError) {
      console.log("Token verification failed:", jwtError.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
        error: jwtError.name,
      });
    }

    if (!decoded) {
      console.log("Token verification failed - empty payload");
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    console.log("Token verified, finding user...");
    const user = await User.findByPk(decoded.userID);

    if (!user) {
      console.log("User not found");
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if user's email is verified (allow SSO users to bypass email verification)
    if (!user.isVerified && !user.googleId && !user.githubId) {
      console.log("User email not verified:", user.email);
      return res.status(403).json({
        success: false,
        message: "Please verify your email before accessing this resource",
        needsVerification: true,
      });
    }

    console.log("User found and verified, proceeding...");
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    // Handle JWT specific errors with appropriate status codes
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
        error: error.message,
      });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message,
    });
  }
};

export const adminRoute = async (req, res, next) => {
  try {
    // Enhanced debugging
    console.log("\n=== ADMIN MIDDLEWARE DEBUG ===");
    console.log("Headers received:", JSON.stringify(req.headers, null, 2));
    console.log(
      "Authorization header:",
      req.headers.authorization || "Not present"
    );
    console.log(
      "Cookies:",
      req.cookies ? JSON.stringify(req.cookies) : "No cookies"
    );

    // Check for token in cookies or Authorization header
    let token = req.cookies?.jwt;

    // If no token in cookies, check Authorization header
    if (!token && req.headers.authorization) {
      console.log("Using Authorization header token");
      token = req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization;
    }

    if (!token) {
      console.log("No token found");
      return res
        .status(401)
        .json({ success: false, message: "Authentication token not found" });
    }

    console.log("Token found, verifying...");
    const decoded = jwt.verify(token, key);

    if (!decoded) {
      console.log("Token verification failed");
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    console.log("Token verified, finding user...");
    const user = await User.findByPk(decoded.userID);

    if (!user) {
      console.log("User not found");
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    if (!user.isAdmin) {
      console.log("User is not admin");
      return res
        .status(403)
        .json({ success: false, message: "access denied: admin only" });
    }

    console.log("Admin user verified, proceeding...");
    req.user = user;
    next();
  } catch (error) {
    console.error("Admin middleware error:", error.message);

    // Handle JWT specific errors with appropriate status codes
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
        error: error.message,
      });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message,
    });
  }
};
