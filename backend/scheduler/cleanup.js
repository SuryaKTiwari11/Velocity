import { cleanupOldOTPs } from "../helper/otpService.js";
import { OTP } from "../model/model.js";

export const cleanupDatabase = async () => {
  try {
    await cleanupOldOTPs();
    const remainingOTPs = await OTP.count();
    // Database cleanup completed
  } catch (error) {
    console.error("Error during database cleanup:", error);
  }
};

export const setupCleanupScheduler = () => {
  setInterval(cleanupDatabase, 24 * 60 * 60 * 1000);
  // Database cleanup scheduler initialized
};
