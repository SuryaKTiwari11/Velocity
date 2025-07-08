import jwt from "jsonwebtoken";
import { User } from "../model/model.js";
import { configDotenv } from "dotenv";
configDotenv();

const key = process.env.JWT_SECRET;

// Helper to extract token from headers or cookies
const getToken = (req) => {
  if (req.headers.authorization) {
    return req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.substring(7)
      : req.headers.authorization;
  }
  return req.cookies?.jwt;
};

// Middleware: Protect routes (JWT authentication)
export const protect = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "authentication token not found" });
    }
    const decoded = jwt.verify(token, key);
    const user = await User.findByPk(decoded.userID);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }
    if (!user.isVerified && !user.googleId && !user.githubId) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email",
        needsVerification: true,
      });
    }
      user.companyId = decoded.companyId;
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
      error: error.message,
    });
  }
};

// Middleware: Admin only access
export const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};

// Middleware: Super Admin only access
export const superAdminOnly = (req, res, next) => {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminGoogleId = process.env.SUPER_ADMIN_GOOGLE_ID;
  const superAdminHash = process.env.SUPER_ADMIN_HASH;
  if (
    req.user &&
    req.user.email === superAdminEmail &&
    req.user.googleId &&
    req.user.googleId.toString() === superAdminGoogleId &&
    (superAdminHash ? req.user.hash === superAdminHash : true)
  ) {
    req.user.isSuperAdmin = true;
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Super admin access required",
  });
};

// Middleware: Require onboarding complete (unless admin)
export const requireOnboardingComplete = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  if (!req.user || req.user.onboardingStatus !== "approved") {
    return res.status(403).json({
      success: false,
      message:
        "Please complete onboarding process before accessing this feature",
      onboardingRequired: true,
      currentStatus: req.user?.onboardingStatus || "pending",
    });
  }
  next();
};
