import Razorpay from "razorpay";
import crypto from "crypto";
import { User, Company, AuditLog } from "../model/model.js";

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Plan configurations (amounts in paise)
const PLANS = {
  basic: {
    price: 99900,
    maxEmployees: 10,
    features: ["Basic Dashboard", "Employee Records"],
  },
  premium: {
    price: 299900,
    maxEmployees: 50,
    features: ["Advanced Analytics", "Reports", "API Access"],
  },
  enterprise: {
    price: 999900,
    maxEmployees: 200,
    features: ["Custom Integration", "Priority Support", "Advanced Security"],
  },
};

export const createOrder = async (req, res) => {
  try {
    const options = {
      amount: 9900,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await rzp.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Payment failed" });
  }
};
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user_id,
    } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
    if (expectedSig === razorpay_signature) {
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      await User.update(
        { isPremium: true, premiumExpiresAt: expiry },
        { where: { id: user_id } }
      );
      res.json({ success: true, message: "You are now premium!" });
    } else {
      res.status(400).json({ error: "Payment verification failed" });
    }
  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
};

export const checkPremium = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ["isPremium", "premiumExpiresAt"],
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    const isPremium =
      user.isPremium &&
      (!user.premiumExpiresAt || new Date() < new Date(user.premiumExpiresAt));
    res.json({ isPremium });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
// Create company plan order
export const createCompanyOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) {
      return res
        .status(400)
        .json({
          error: "Invalid plan selected",
          availablePlans: Object.keys(PLANS),
        });
    }
    const options = {
      amount: PLANS[plan].price,
      currency: "INR",
      receipt: `company_${req.user.companyId}_${Date.now()}`,
      notes: { companyId: req.user.companyId, plan },
    };
    const order = await rzp.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Order creation failed" });
  }
};

// Verify company plan payment and upgrade
export const verifyCompanyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } =
      req.body;
    const companyId = req.user.companyId;
    if (!PLANS[plan])
      return res.status(400).json({ error: "Invalid plan selected" });
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
    if (expectedSig !== razorpay_signature)
      return res.status(400).json({ error: "Payment verification failed" });
    const payment = await rzp.payments.fetch(razorpay_payment_id);
    if (payment.status !== "captured")
      return res.status(402).json({ error: "Payment not captured" });
    const company = await Company.findByPk(companyId);
    const prevPlan = company?.plan || "none";
    await Company.update(
      {
        plan,
        maxEmployees: PLANS[plan].maxEmployees,
        planFeatures: PLANS[plan].features,
        lastPaymentId: razorpay_payment_id,
        planUpgradedAt: new Date(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      { where: { id: companyId } }
    );
    await AuditLog.create({
      companyId,
      userId: req.user.id,
      action: "PLAN_UPGRADED",
      details: {
        from: prevPlan,
        to: plan,
        paymentId: razorpay_payment_id,
        amount: payment.amount / 100,
      },
    });
    res.json({
      success: true,
      newPlan: plan,
      maxEmployees: PLANS[plan].maxEmployees,
      features: PLANS[plan].features,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Plan upgrade failed", details: error.message });
  }
};
export const razorpayWebhookHandler = async (req, res) => {
  const sig = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);
  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");
  if (sig !== expectedSig) {
    return res.status(400).json({ error: "Invalid signature" });
  }
  // Handle the webhook event
  const event = req.body.event;
  switch (event) {
    case "payment.captured":
      // Handle successful payment capture
      break;
    case "payment.failed":
      // Handle failed payment
      break;
    default:
      return res.status(400).json({ error: "Unknown event" });
  }
  res.json({ received: true });
};
export const getPlanDetails = (req, res) => {
  const { plan } = req.query;
  if (!PLANS[plan]) {
    return res.status(400).json({ error: "Invalid plan" });
  }
  res.json({
    plan,
    price: PLANS[plan].price,
    maxEmployees: PLANS[plan].maxEmployees,
    features: PLANS[plan].features,
  });
};