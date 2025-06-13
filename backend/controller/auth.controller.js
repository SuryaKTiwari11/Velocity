import { User, Employee } from "../model/index.js";
import bcrypt from "bcryptjs";
import { genToken } from "../helper/genToken.js";
import jwt from "jsonwebtoken";
export const signUp = async (req, res) => {
  try {
    console.log("Signup request received:", req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log("Missing credentials in signup");
      return res
        .status(400)
        .json({ success: false, error: "missing credentials" });
    }

    // Check if user already exists
    const isUser = await User.findOne({ where: { email } });
    if (isUser) {
      console.log("User with this email already exists:", email);
      return res
        .status(400)
        .json({ success: false, error: "user with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // First create the user
    console.log("Creating user:", name, email);
    const user = await User.create({
      name,
      email,
      password: hashed,
      isVerified: false, // Explicitly set as false until OTP verification
    });

    console.log("User created with ID:", user.id);

    try {
      // Then create an associated employee with the same email (this is our relationship key)
      console.log("Creating associated employee record");
      const employee = await Employee.create({
        name,
        email, // Same email links the two records
        position: "Not specified",
        department: "Unassigned",
        salary: 0, // Default value
      });
      console.log("Employee record created with ID:", employee.id);
    } catch (empError) {
      console.error("Error creating employee record:", empError);
      // Continue with the signup process even if employee creation fails
      // We can handle this separately or create the employee record later
    }

    console.log("Generating token for user:", user.id);
    const token = genToken(user.id, res);
    res.cookie("jwt", token);

    // Automatically send verification OTP
    try {
      console.log("Sending verification OTP to:", email);
      const { sendOTP } = await import("../helper/otpService.js");
      const otpResult = await sendOTP(email, name);

      if (otpResult.success) {
        console.log("Verification OTP sent successfully");
      } else {
        console.error("Failed to send verification OTP:", otpResult.message);
      }
    } catch (otpError) {
      console.error("Error sending verification OTP:", otpError);
    }

    //! i realized that we only need to send certain data back to the client
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "user created successfully",
      user: userResponse,
      token: token,
      verificationRequired: true,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide email and password" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res
        .status(401)
        .json({ success: false, error: "Invalid password" });

    // Check if the user has verified their email
    if (!user.isVerified && !user.googleId && !user.githubId) {
      // Skip for SSO users
      console.log("Login attempt by unverified user:", email);
      return res.status(403).json({
        success: false,
        error: "Please verify your email before logging in",
        needsVerification: true,
        email: user.email,
      });
    }

    const token = genToken(user.id, res);
    res.cookie("jwt", token);

    // Send only essential user information
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userResponse,
      token: token, // Explicitly include token in the response body
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * User logout
 */
export const logout = async (req, res) => {
  try {
    console.log("Logout requested");

    // Clear the JWT cookie by setting it to empty and making it expire immediately
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0), // Immediately expire the cookie
    });

    // Also clear other potential cookies if any
    res.clearCookie("jwt");

    console.log("Cookies cleared during logout");
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
      clearLocalStorage: true, // Signal to frontend to clear local storage
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get current user information
 */
export const getCurrentUser = async (req, res) => {
  try {
    console.log("Getting current user...");

    // Check for token in cookies or Authorization header - same logic as middleware
    let token = req.cookies?.jwt;

    if (!token && req.headers.authorization) {
      console.log("Using Authorization header token in getCurrentUser");
      token = req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization;
    }

    if (!token) {
      console.log("No token found in getCurrentUser");
      return res
        .status(401)
        .json({ success: false, message: "Authentication token not found" });
    }

    console.log("Token found in getCurrentUser, verifying...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userID);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    } // Look for associated employee using email as the relationship key
    const employee = await Employee.findOne({ where: { email: user.email } });

    // No need to return an error if employee not found - just return null for employeeInfo
    // This makes the API more flexible
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    };

    // Include employee information if needed
    const employeeInfo = employee
      ? {
          id: employee.id,
          position: employee.position,
          department: employee.department,
          salary: employee.salary,
        }
      : null;

    return res.status(200).json({
      success: true,
      user: userResponse,
      employeeInfo: employeeInfo,
    });
  } catch (error) {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
};
