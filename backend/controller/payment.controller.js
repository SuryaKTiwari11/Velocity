import Razorpay from "razorpay";
import crypto from "crypto";
import { User } from "../model/model.js";


const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
