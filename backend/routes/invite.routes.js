import express from "express";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import {
  createInvite,
  validateInviteToken,
  validateInviteAndSignup,
} from "../controller/invite.controller.js";

const router = express.Router();

router.post("/", protect, adminOnly, createInvite);

router.get("/validate", validateInviteToken);

router.post("/signup", validateInviteAndSignup);

export default router;
