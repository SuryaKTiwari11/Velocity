import express from "express";
import { getStats } from "../queues/email.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();
const stats = async (req, res) => {
  try {
    const emailStats = await getStats();
    res.json({
      success: true,
      stats: {
        email: emailStats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getting queue stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get queue statistics",
      error: error.message,
    });
  }
};
router.get("/stats", protect, adminOnly, stats);

export default router;
