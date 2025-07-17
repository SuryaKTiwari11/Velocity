// !Auto Attendance Cleanup Scheduler
//! Runs periodically to handle session timeouts and cleanup

import cron from "node-cron";
import { cleanupOldSessions } from "../services/attendanceService.js";

export const setupAttendanceCleanup = () => {
  //! Run every 30 minutes to cleanup old sessions
  cron.schedule("*/30 * * * *", async () => {
    try {
      // Running attendance cleanup
      await cleanupOldSessions();
    } catch (error) {
      console.error("Attendance cleanup error:", error);
    }
  });

  // Attendance cleanup scheduler started
};
