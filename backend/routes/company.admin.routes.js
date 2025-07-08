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
router.get("/usage", protect, getCompanyUsage);
router.get("/admins", protect, adminOnly, listAdmins);
router.delete("/admins/:userId", protect, superAdminOnly, removeAdmin);
router.get("/subscription", protect, getSubscriptionStatus);

export default router;
