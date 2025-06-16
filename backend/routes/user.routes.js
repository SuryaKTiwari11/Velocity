import express from "express";
import { signUp, login, logout, getCurrentUser } from "../controller/auth.controller.js";
import { authSuccess, handleCallback } from "../controller/ssoAuth.controller.js";
import { forgotPassword, verifyResetOTP, resetPassword } from "../controller/password.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
import passport from "../configuration/passport.js";

const router = express.Router();


router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protectedRoute, getCurrentUser);
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/login" }), handleCallback);
router.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));
router.get("/auth/github/callback", passport.authenticate("github", { session: false, failureRedirect: "/login" }), handleCallback);
router.get("/auth/success", authSuccess);

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

export default router;
