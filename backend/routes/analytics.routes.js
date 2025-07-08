import express from "express";
import {
  getEmployeeStats,
  getDocumentStats,
  getRevenueStats,
  getDashboardData,
} from "../controller/analytics.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Analytics routes (admin only)
router.get("/dashboard", protect, adminOnly, getDashboardData);
router.get("/employees", protect, adminOnly, getEmployeeStats);
router.get("/documents", protect, adminOnly, getDocumentStats);
router.get("/revenue", protect, adminOnly, getRevenueStats);

export default router;
