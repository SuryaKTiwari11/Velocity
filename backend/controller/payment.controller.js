// Razorpay Webhook Handler
export const razorpayWebhookHandler = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const body = req.body;

    // Webhook body is already parsed as JSON if using express.json(), else use express.raw()
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(body))
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = body;

    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case "payment.failed":
        // Optionally implement handlePaymentFailed
        break;
      case "subscription.charged":
        // Optionally implement handleSubscriptionCharged
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

// Helper for payment captured
async function handlePaymentCaptured(payment) {
  // Find company by Razorpay order ID (assuming you store order_id in lastPaymentId or metadata)
  // Adjust the query as per your schema
  const company = await Company.findOne({ lastPaymentId: payment.order_id });
  if (company) {
    await Company.update(
      {
        status: "active",
        lastPaymentDate: new Date(),
        paymentStatus: "paid",
      },
      { where: { id: company.id } }
    );
  }
}
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
    // Default user-level premium plan (can be extended to accept plan param)
    const options = {
      amount: 9900, // INR 99.00
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await rzp.orders.create(options);
    res.json(order);
  } catch (error) {
    console.log("Payment error:", error);
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
      res.json({
        success: true,
        message: "You are now premium!",
      });
    } else {
      res.status(400).json({ error: "Payment verification failed" });
    }
  } catch (error) {
    console.log("Verification error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
};

export const checkPremium = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ["isPremium", "premiumExpiresAt"],
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isPremium =
      user.isPremium &&
      (!user.premiumExpiresAt || new Date() < new Date(user.premiumExpiresAt));
    res.json({ isPremium });
  } catch (error) {
    console.log("Premium check error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
// Create company plan order
export const createCompanyOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) {
      return res.status(400).json({
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
    console.error("Company order error:", error);
    res.status(500).json({ error: "Order creation failed" });
  }
};

// Verify company plan payment and upgrade
export const verifyCompanyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } =
      req.body;
    const companyId = req.user.companyId;

    if (!PLANS[plan]) {
      return res.status(400).json({ error: "Invalid plan selected" });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Fetch payment details
    const payment = await rzp.payments.fetch(razorpay_payment_id);
    if (payment.status !== "captured") {
      return res.status(402).json({ error: "Payment not captured" });
    }

    // Get current company plan for audit log
    const company = await Company.findByPk(companyId);
    const prevPlan = company?.plan || "none";

    // Update company plan
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

    // Log the upgrade
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
    console.error("Company upgrade error:", error);
    res
      .status(500)
      .json({ error: "Plan upgrade failed", details: error.message });
  }
};
