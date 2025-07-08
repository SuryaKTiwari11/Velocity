import express from "express";
import {
  getTodayAttendance,
  getAttendanceHistory,
  getAttendanceStats,
  getAllAttendance,
  getActiveUsers,
} from "../controller/attendance.controller.js";
import {
  protect,
  requireOnboardingComplete,
  adminOnly,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(requireOnboardingComplete);
router.get("/today", getTodayAttendance);
router.get("/history", getAttendanceHistory);
router.get("/stats", getAttendanceStats);
router.get("/admin/all", adminOnly, getAllAttendance);
router.get("/admin/active", adminOnly, getActiveUsers);

export default router;
