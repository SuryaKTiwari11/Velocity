import { configDotenv } from "dotenv";
import { autoClockIn } from "../services/attendanceService.js";
configDotenv();
export const authSuccess = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "authentication failed",
      });
    }

    const token = user.token;

    res.cookie("jwt", token);

    // 🚀 AUTO ATTENDANCE: Start tracking attendance for Google login
    try {
      await autoClockIn(user.user.id, req.sessionID, req.ip);
      console.log(`✅ Google OAuth: Auto clock-in for user ${user.user.id}`);
    } catch (attendanceError) {
      console.error("❌ Google OAuth auto clock-in failed:", attendanceError);
      // Don't fail the login if attendance fails
    }

    return res.status(200).json({
      success: true,
      message: "authentication successful",
      user: user.user,
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error during authentication",
      error: error.message,
    });
  }
};
export const handleCallback = async (req, res) => {
  try {
    const { user, token } = req.user || {};

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=failed`);
    }

    res.cookie("jwt", token);

    // 🚀 AUTO ATTENDANCE: Start tracking attendance for Google login callback
    try {
      await autoClockIn(user.id, req.sessionID, req.ip);
      console.log(
        `✅ Google OAuth Callback: Auto clock-in for user ${user.id}`
      );
    } catch (attendanceError) {
      console.error(
        "❌ Google OAuth callback auto clock-in failed:",
        attendanceError
      );
      // Don't fail the login if attendance fails
    }

    return res.redirect(
      `${process.env.FRONTEND_URL}/login/success?token=${encodeURIComponent(
        token
      )}`
    );
  } catch (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=server`);
  }
};
