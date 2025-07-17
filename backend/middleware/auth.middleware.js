import jwt from "jsonwebtoken";
import { User } from "../model/model.js";
import { configDotenv } from "dotenv";

configDotenv();

const key = process.env.JWT_SECRET;

const getToken = (req) => {
  if (req.headers.authorization) {
    return req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.substring(7)
      : req.headers.authorization;
  }
  return req.cookies?.jwt;
};

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

    // Always use a plain object for req.user
    const plainUser = user.get ? user.get({ plain: true }) : user;
    plainUser.companyId = user.companyId || decoded.companyId;
    plainUser.id = user.id || decoded.userID;
    req.user = plainUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
      error: error.message,
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};

export const superAdminOnly = (req, res, next) => {
  const { SUPER_ADMIN_EMAIL, SUPER_ADMIN_GOOGLE_ID, SUPER_ADMIN_HASH } =
    process.env;
  const isSuperAdmin =
    req.user &&
    req.user.email === SUPER_ADMIN_EMAIL &&
    ((req.user.googleId &&
      req.user.googleId.toString() === SUPER_ADMIN_GOOGLE_ID) ||
      (SUPER_ADMIN_HASH && req.user.hash === SUPER_ADMIN_HASH));

  if (isSuperAdmin) {
    req.user.isSuperAdmin = true;
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Super admin access required",
  });
};

export const requireOnboardingComplete = (req, res, next) => {
  if (req.user && (req.user.isAdmin || req.user.isSuperAdmin)) return next();

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
