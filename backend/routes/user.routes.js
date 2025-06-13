import express from "express";
import {
  signUp,
  login,
  logout,
  getCurrentUser,
} from "../controller/auth.controller.js";
import {
  googleAuthCallback,
  githubAuthCallback,
  authSuccess,
} from "../controller/ssoAuth.controller.js";
import {
  sendEmailOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} from "../controller/password.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
import passport from "../configuration/passport.js";

const router = express.Router();

// Basic Auth Routes
router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protectedRoute, getCurrentUser);
router.post("/otp", sendEmailOTP); // Legacy route, maintaining for backward compatibility

// Google OAuth routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  googleAuthCallback
);

// GitHub OAuth routes
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);
router.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/login",
  }),
  githubAuthCallback
);

// Common route for all SSO successes
router.get("/auth/success", authSuccess);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

export default router;
