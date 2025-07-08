import express from "express";
import {
  protect,
  adminOnly,
  superAdminOnly,
} from "../middleware/auth.middleware.js";
import {
  getCompanyUsage,
  listAdmins,
  removeAdmin,
  getSubscriptionStatus,
} from "../controller/company.admin.controller.js";

const router = express.Router();

// Company usage analytics
router.get("/usage", protect, getCompanyUsage);

// List company admins
router.get("/admins", protect, adminOnly, listAdmins);

// Remove admin
router.delete("/admins/:userId", protect, superAdminOnly, removeAdmin);

// Subscription status
router.get("/subscription", protect, getSubscriptionStatus);

export default router;
