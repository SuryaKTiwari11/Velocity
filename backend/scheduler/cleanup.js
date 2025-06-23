/**
 * Scheduled database cleanup tasks
 */
import { cleanupOldOTPs } from "../helper/otpService.js";
import { OTP } from "../model/model.js";
import { Op } from "sequelize";

export const cleanupDatabase = async () => {
  try {
    console.log("Running scheduled database cleanup...");

    await cleanupOldOTPs();


    const remainingOTPs = await OTP.count();
    console.log(`Database cleanup completed. Remaining OTPs: ${remainingOTPs}`);
  } catch (error) {
    console.error("Error during database cleanup:", error);
  }
};

export const setupCleanupScheduler = () => {
  cleanupDatabase();

  setInterval(cleanupDatabase, 24 * 60 * 60 * 1000);

  console.log("Database cleanup scheduler initialized");
};
