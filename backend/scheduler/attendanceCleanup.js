// !Auto Attendance Cleanup Scheduler
//! Runs periodically to handle session timeouts and cleanup

import cron from "node-cron";
import * as AttendanceService from "../services/attendanceService.js";

export const setupAttendanceCleanup = () => {
  //! Run every 30 minutes to cleanup old sessions
  cron.schedule("*/30 * * * *", async () => {
    try {
      console.log("Running attendance cleanup...");
      await AttendanceService.cleanupOldSessions();
    } catch (error) {
      console.error("Attendance cleanup error:", error);
    }
  });

  console.log("Attendance cleanup scheduler started");
};
