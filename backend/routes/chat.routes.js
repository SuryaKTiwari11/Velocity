import express from "express";
import { protect,requireOnboardingComplete } from "../middleware/auth.middleware.js";
import {
  getStreamToken,
  upsertTargetUser,
} from "../controller/chat.controller.js";

const router = express.Router();

router.get("/token", protect, requireOnboardingComplete, getStreamToken);
router.post("/upsert-user/:targetUserId", protect, requireOnboardingComplete, upsertTargetUser);

export default router;
