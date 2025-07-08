import express from "express";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import {
  createInvite,
  validateInviteToken,
  validateInviteAndSignup,
} from "../controller/invite.controller.js";

const router = express.Router();

// Admin creates an invite
router.post("/invite", protect, adminOnly, createInvite);

// Validate invite token (for signup page prefill/validation)
router.get("/invite/validate", validateInviteToken);

// Accept invite and signup (invite-only signup)
router.post("/invite/signup", validateInviteAndSignup);

export default router;
