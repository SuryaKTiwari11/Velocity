import express from "express";
import {
  getAllCompanies,
  getAllUsers,
  getAllPayments,
  getAllInvites,
  deleteCompany,
} from "../controller/superAdmin.controller.js";
import { protect, superAdminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect)
router.use(superAdminOnly);

// All endpoints support pagination via ?page=1&limit=20
router.get("/companies", getAllCompanies); // ?page=1&limit=20
router.get("/users", getAllUsers); // ?page=1&limit=20
router.get("/payments", getAllPayments); // ?page=1&limit=20
router.get("/invites", getAllInvites); // ?page=1&limit=20

// Delete company (super admin only)
router.delete("/companies/:id", deleteCompany);

// Add more endpoints as needed

export default router;
