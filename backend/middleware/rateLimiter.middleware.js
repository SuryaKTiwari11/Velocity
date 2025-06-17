import { rateLimit } from "express-rate-limit";
export const stdLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 200,
  message: "Too many requests",
});
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: "Too many authentication requests",
});
//!two many otp request
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  message: "Too many OTP requests",
});
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  message: "Too many password reset requests, please try again later",
});
//!BRUTE FORCE ATTACKS NA HO
export const rateLimiterMiddleware = (req, res, next) => {
  if (req.path.includes("/auth/")) {
    authLimiter(req, res, next);
  } else if (req.path.includes("/otp/")) {
    otpLimiter(req, res, next);
  } else if (
    req.path.includes("forgot-password") ||
    req.path.includes("verify-reset-otp") ||
    req.path.includes("reset-password")
  ) {
    passwordResetLimiter(req, res, next);
  } else {
    stdLimiter(req, res, next);
  }
};
