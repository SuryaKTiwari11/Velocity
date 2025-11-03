import express from "express";
import {
  clockIn,
  clockOut,
  getActiveUsers,
  getTodayAttendance,
  getAttendanceHistory,
  getActiveUserCount,
  getAllAttendance,
  fixStaleAttendance,
} from "../controller/attendance.controller.js";

import {
  requireOnboardingComplete,
  adminOnly,
  protect,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply middleware to all routes
router.use(protect, requireOnboardingComplete);

// Core attendance operations
router.post("/clock-in", clockIn);
router.post("/clock-out", clockOut);
router.get("/today", getTodayAttendance);
router.get("/history", getAttendanceHistory);

// Real-time features (Redis-cached)
router.get("/active", getActiveUsers);
router.get("/active-count", getActiveUserCount);

// Admin-only routes
router.get("/admin/all", adminOnly, getAllAttendance);
router.get("/admin/active", adminOnly, getActiveUsers);
router.post("/admin/fix-stale", adminOnly, fixStaleAttendance);

export default router;
