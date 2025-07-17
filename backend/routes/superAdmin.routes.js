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
router.get("/companies", getAllCompanies);
router.get("/users", getAllUsers);
router.get("/payments", getAllPayments);
router.get("/invites", getAllInvites);
router.delete("/companies/:id", deleteCompany);

export default router;
