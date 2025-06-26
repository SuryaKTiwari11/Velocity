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

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "user not found" });

    if (!user.isVerified && !user.googleId && !user.githubId) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email",
        needsVerification: true,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "authentication error",
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

export const protectedRoute = protect;
export const adminRoute = async (req, res, next) => {
  protect(req, res, () => {
    adminOnly(req, res, next);
  });
};
