import express from "express";
import {
  findEMPbyID,
  createEMP,
  AllEMP,
  updateEMP,
  deleteEMP,
} from "../controller/employee.controller.js";
import { protectedRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
router.get("/", protectedRoute, AllEMP);
router.post("/", adminRoute, createEMP);
router.get("/:id", protectedRoute, findEMPbyID);
router.put("/:id", adminRoute, updateEMP);
router.delete("/:id", adminRoute, deleteEMP);

export default router;
