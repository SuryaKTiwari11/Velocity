import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createOrder,
  verifyPayment,
  checkPremium,
} from "../controller/payment.controller.js";

const router = express.Router();


router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.get("/premium-status", protect, checkPremium);

export default router;
