import express from "express";
import { getStats } from "../queues/email.js";
import { getCleanStats } from "../queues/clean.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get stats
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const email = await getStats();
    const clean = await getCleanStats();

    res.json({
      success: true,
      stats: { email, clean },
      time: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({
      success: false,
      message: "Stats failed",
      error: error.message,
    });
  }
});

export default router;
