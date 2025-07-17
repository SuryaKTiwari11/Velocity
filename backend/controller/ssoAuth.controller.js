import { configDotenv } from "dotenv";
import { autoClockIn } from "../services/attendanceService.js";
configDotenv();
export const authSuccess = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "authentication failed" });
    }
    const token = user.token;
    res.cookie("jwt", token);
    try {
      await autoClockIn(
        user.user.id,
        req.sessionID,
        req.ip,
        user.user.companyId
      );
    } catch (attendanceError) {
      console.error("Google OAuth auto clock-in failed:", attendanceError);
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
    try {
      await autoClockIn(user.id, req.sessionID, req.ip, user.companyId);
      // Auto clock-in for Google OAuth callback
    } catch (attendanceError) {
      console.error(
        "Google OAuth callback auto clock-in failed:",
        attendanceError
      );
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
