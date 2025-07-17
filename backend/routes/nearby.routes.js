import express from "express";
const router = express.Router();
import { findNearby, updateLocation } from "../controller/nearby.controller.js";
import { protect } from "../middleware/auth.middleware.js";
router.use(protect);
router.post("/nearby", findNearby);
router.post("/update", updateLocation);

export default router;
