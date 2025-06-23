/**
 * Scheduled database cleanup tasks
 */
import { cleanupOldOTPs } from "../helper/otpService.js";
import { OTP } from "../model/model.js";
import { Op } from "sequelize";

// Clean up all expired OTPs and old verified OTPs
export const cleanupDatabase = async () => {
  try {
    console.log("Running scheduled database cleanup...");

    // Clean up OTPs
    await cleanupOldOTPs();

    // Log statistics
    const remainingOTPs = await OTP.count();
    console.log(`Database cleanup completed. Remaining OTPs: ${remainingOTPs}`);
  } catch (error) {
    console.error("Error during database cleanup:", error);
  }
};

// Function to setup cleanup schedule
export const setupCleanupScheduler = () => {
  // Run cleanup immediately on startup
  cleanupDatabase();

  // Schedule regular cleanup (every 24 hours)
  setInterval(cleanupDatabase, 24 * 60 * 60 * 1000);

  console.log("Database cleanup scheduler initialized");
};
