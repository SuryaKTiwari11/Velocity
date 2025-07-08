import express from "express";
import passport from "../configuration/passport.js";
import { protect } from "../middleware/auth.middleware.js";

// Auth Controllers
import {
  signUp,
  login,
  logout,
  curUser,
} from "../controller/auth.controller.js";

// SSO Controllers
import {
  authSuccess,
  handleCallback,
} from "../controller/ssoAuth.controller.js";

// Password Controllers
import {
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} from "../controller/password.controller.js";

// User Controllers
import {
  getLivekitToken,
  searchUsers,
} from "../controller/user.controller.js";

const router = express.Router();

// Auth routes
router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, curUser);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

// Video call token
router.post("/livekit-token", getLivekitToken);

// User search
router.get("/search", protect, searchUsers);

// Google OAuth
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

// SSO Auth Success
router.get("/auth/success", authSuccess);

export default router;
