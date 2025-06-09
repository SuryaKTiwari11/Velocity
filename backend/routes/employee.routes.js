import express from "express";
import {
  findEMPbyID,
  createEMP,
  AllEMP,
  updateEMP,
  deleteEMP,
} from "../controller/employee.controller.js";
const router = express.Router();
router.get("/", AllEMP);
router.post("/", createEMP);
router.get("/:id", findEMPbyID);
router.put("/:id", updateEMP);
router.delete("/:id", deleteEMP);

export default router;
