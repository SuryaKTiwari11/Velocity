import { User } from "../model/model.js";

export const checkPremium = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ["isPremium", "premiumExpiresAt"],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isValid =
      user.isPremium &&
      (!user.premiumExpiresAt || new Date() < new Date(user.premiumExpiresAt));

    if (!isValid) {
      return res.status(403).json({ error: "Premium subscription required" });
    }

    next();
  } catch (error) {
    console.log("Premium check error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
