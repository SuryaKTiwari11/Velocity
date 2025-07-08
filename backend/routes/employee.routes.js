import express from "express";
import {
  findEMPbyID,
  createEMP,
  AllEMP,
  updateEMP,
  deleteEMP,
  filterOpts,
} from "../controller/employee.controller.js";
import { requireOnboardingComplete, adminOnly,protect } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect);
router.get("/", requireOnboardingComplete, AllEMP);
router.get("/filter", requireOnboardingComplete, filterOpts);
router.post("/", adminOnly, createEMP);
router.get("/:id", requireOnboardingComplete, findEMPbyID);
router.put("/:id", adminOnly, updateEMP);
router.delete("/:id", adminOnly, deleteEMP);

export default router;
