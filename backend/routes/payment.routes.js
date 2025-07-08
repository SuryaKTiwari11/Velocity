import express from "express";
import {
  requireOnboardingComplete,
  protect,
} from "../middleware/auth.middleware.js";
import {
  createOrder,
  verifyPayment,
  checkPremium,
  createCompanyOrder,
  verifyCompanyPayment,
  razorpayWebhookHandler
} from "../controller/payment.controller.js";

const router = express.Router();

// User-level payment
router.post("/create-order", protect, requireOnboardingComplete, createOrder);
router.post(
  "/verify-payment",
  protect,
  requireOnboardingComplete,
  verifyPayment
);
router.get("/premium-status", protect, checkPremium);

// Company-level payment
router.post("/company/create-order", protect, createCompanyOrder);
router.post("/company/verify-payment", protect, verifyCompanyPayment);

router.post(
  "/webhook/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhookHandler 
);

export default router;
