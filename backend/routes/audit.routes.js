import express from "express";
import {
  getLogs,
  getLoginHistory,
  getStats,
} from "../controller/audit.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/logs", getLogs);
router.get("/login-history", getLoginHistory);
router.get("/stats", getStats);

export default router;
