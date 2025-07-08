import express from "express";
import {
  signUp,
  login,
  logout,
  curUser,
} from "../controller/auth.controller.js";
import { getLivekitToken, searchUsers } from "../controller/user.controller.js";
import {
  authSuccess,
  handleCallback,
} from "../controller/ssoAuth.controller.js";
import {
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} from "../controller/password.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import passport from "../configuration/passport.js";
const router = express.Router();
//
router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, curUser);
// Video call token endpoint
router.post("/livekit-token", getLivekitToken);
// Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
// Google OAuth
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  handleCallback
);

// GitHub OAuth
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
  handleCallback
);

// SSO Auth Success (for frontend polling or direct success endpoint)
router.get("/auth/success", authSuccess);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

// Search users for chat
router.get("/search", protect, searchUsers);

export default router;
