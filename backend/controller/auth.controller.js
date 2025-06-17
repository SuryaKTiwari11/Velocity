import { User, Employee } from "../model/model.js";
import bcrypt from "bcryptjs";
import { genToken } from "../helper/genToken.js";
import jwt from "jsonwebtoken";
import { sendOTP } from "../helper/otpService.js";

const userRes = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  isVerified: user.isVerified,
  profilePicture: user.profilePicture,
  createdAt: user.createdAt,
});

export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res
        .status(400)
        .json({ success: false, error: "missing credentials" });

    const isUser = await User.findOne({ where: { email } });
    if (isUser) {
      return res
        .status(400)
        .json({ success: false, error: "user with this email already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      password: hashed,
      isVerified: false,
    });

    // Create employee record in background
    Employee.create({
      name,
      email,
      position: "not assigned yet",
      department: "not assigned yet",
      salary: 0,
    }).catch((empError) => {
      console.error("Error creating employee record:", empError);
    });

    const token = genToken(user.id, res);

    // Send OTP in the background without awaiting
    sendOTP(email).catch((otpError) => {
      console.error("Error sending OTP during signup:", otpError);
    });

    res.status(201).json({
      success: true,
      message: "user created successfully",
      user: userRes(user),
      token,
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

    if (!user.isVerified && !user.googleId && !user.githubId) {
      return res.status(403).json({
        success: false,
        error: "Please verify your email before logging in",
        needsVerification: true,
        email: user.email,
      });
    }

    const token = genToken(user.id, res);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userRes(user),
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    let token =
      req.cookies?.jwt ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization);

    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Authentication token not found" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userID);

    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    const employee = await Employee.findOne({ where: { email: user.email } });
    const employeeInfo = employee
      ? {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          position: employee.position,
          department: employee.department,
          salary: employee.salary,
        }
      : null;

    return res.status(200).json({
      success: true,
      user: userRes(user),
      employeeInfo,
    });
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
};
