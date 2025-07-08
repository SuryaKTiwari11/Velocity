import { Attendance, User} from "../model/model.js";
import { Op } from "sequelize";
import { io } from "../index.js"; 

async function autoClockIn(userId, sessionId, ipAddress = null) {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Check if user already has ANY attendance record today (active or inactive)
    const existingAttendance = await Attendance.findOne({
      where: {
        userId,
        date: today,
      },
    });

    if (existingAttendance) {
      if (existingAttendance.isActive) {
      
        await existingAttendance.update({ sessionId });
        console.log(
          `ℹ️ User ${userId} already clocked in today, updated session`
        );
        return existingAttendance;
      } else {
        // Reactivate existing record (user logging in again after logout)
        const clockInTime = new Date();
        await existingAttendance.update({
          clockInTime,
          isActive: true,
          sessionId,
          clockOutTime: null, // Reset clock out
          totalHours: 0, // Reset hours
        });

        // Emit real-time update via WebSocket
        emitAttendanceUpdate(userId, "clock-in", existingAttendance);

        console.log(
          `✅ Reactivated attendance: User ${userId} at ${clockInTime}`
        );
        return existingAttendance;
      }
    }

    // Create new attendance record (first login today)
    const attendance = await Attendance.create({
      userId,
      clockInTime: new Date(),
      date: today,
      isActive: true,
      sessionId,
      ipAddress,
      status: "present",
    });

    // Emit real-time update via WebSocket
    emitAttendanceUpdate(userId, "clock-in", attendance);

    console.log(`✅ Auto clock-in: User ${userId} at ${new Date()}`);
    return attendance;
  } catch (error) {
    console.error("❌ Auto clock-in error:", error);
    console.error("Error details:", error.message);
    throw error;
  }
}

/**
 * Auto clock-out when user logs out
 */
async function autoClockOut(userId, sessionId = null) {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Find active attendance record - try with sessionId first, then without
    let attendance = null;

    if (sessionId) {
      attendance = await Attendance.findOne({
        where: {
          userId,
          date: today,
          isActive: true,
          sessionId: sessionId,
        },
      });
    }
    // If no exact session match, find any active attendance for this user today
    if (!attendance) {
      attendance = await Attendance.findOne({
        where: {
          userId,
          date: today,
          isActive: true,
        },
      });
    }

    if (!attendance) {
      console.log(`⚠️ No active attendance found for user ${userId}`);
      return null;
    }

    const clockOutTime = new Date();
    const totalHours = calculateHours(attendance.clockInTime, clockOutTime);

    await attendance.update({
      clockOutTime,
      totalHours,
      isActive: false,
    });

    // Emit real-time update via WebSocket
    emitAttendanceUpdate(userId, "clock-out", attendance);

    console.log(`✅ Auto clock-out: User ${userId} worked ${totalHours} hours`);
    return attendance;
  } catch (error) {
    console.error("❌ Auto clock-out error:", error);
    throw error;
  }
}

/**
 * Handle session timeout (automatic logout)
 */
async function handleSessionTimeout(sessionId) {
  try {
    const attendance = await Attendance.findOne({
      where: {
        sessionId,
        isActive: true,
      },
    });

    if (attendance) {
      await autoClockOut(attendance.userId, sessionId);
      console.log(`⏰ Session timeout handled for user ${attendance.userId}`);
    }
  } catch (error) {
    console.error("❌ Session timeout error:", error);
  }
}

/**
 * Calculate working hours between two times
 */
function calculateHours(clockIn, clockOut) {
  const diffMs = new Date(clockOut) - new Date(clockIn);
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
}

/**
 * Get today's attendance for a user
 */
async function getTodayAttendance(userId) {
  try {
    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({
      where: {
        userId,
        date: today,
      },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return attendance;
  } catch (error) {
    console.error("❌ Get today attendance error:", error);
    throw error;
  }
}

/**
 * Get attendance history with pagination
 */
async function getAttendanceHistory(userId, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;

    const { count, rows } = await Attendance.findAndCountAll({
      where: { userId },
      order: [["date", "DESC"]],
      limit: parseInt(limit),
      offset,
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return {
      attendance: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
        recordsPerPage: limit,
      },
    };
  } catch (error) {
    console.error("❌ Get attendance history error:", error);
    throw error;
  }
}

/**
 * Get attendance stats for a user
 */
async function getAttendanceStats(userId, startDate = null, endDate = null) {
  try {
    const whereCondition = { userId };

    if (startDate && endDate) {
      whereCondition.date = {
        [Op.between]: [startDate, endDate],
      };
    } else {
      // Default to current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      whereCondition.date = {
        [Op.between]: [
          startOfMonth.toISOString().split("T")[0],
          endOfMonth.toISOString().split("T")[0],
        ],
      };
    }

    const attendance = await Attendance.findAll({
      where: whereCondition,
      attributes: ["totalHours", "date", "status"],
    });

    const totalDaysWorked = attendance.length;
    const totalHours = attendance.reduce(
      (sum, record) => sum + (parseFloat(record.totalHours) || 0),
      0
    );
    const averageHours = totalDaysWorked > 0 ? totalHours / totalDaysWorked : 0;
    const presentDays = attendance.filter(
      (record) => record.status === "present"
    ).length;

    return {
      totalDaysWorked,
      totalHours: Math.round(totalHours * 100) / 100,
      averageHours: Math.round(averageHours * 100) / 100,
      presentDays,
      attendanceRate:
        totalDaysWorked > 0
          ? Math.round((presentDays / totalDaysWorked) * 100)
          : 0,
    };
  } catch (error) {
    console.error("❌ Get attendance stats error:", error);
    throw error;
  }
}

/**
 * Emit real-time attendance updates via WebSocket
 */
function emitAttendanceUpdate(userId, action, attendanceData) {
  try {
    if (io) {
      // Emit to specific user
      io.to(`user_${userId}`).emit("attendance_update", {
        action,
        data: attendanceData,
        timestamp: new Date(),
      });

      // Emit to admin users for monitoring
      io.to("admin_room").emit("user_attendance_update", {
        userId,
        action,
        data: attendanceData,
        timestamp: new Date(),
      });
    }
  } catch (error) {
    console.error("❌ WebSocket emit error:", error);
  }
}

/**
 * Cleanup old sessions (run periodically)
 */
async function cleanupOldSessions() {
  try {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    const oldActiveSessions = await Attendance.findAll({
      where: {
        isActive: true,
        clockInTime: {
          [Op.lt]: cutoffTime,
        },
      },
    });

    for (const attendance of oldActiveSessions) {
      await autoClockOut(attendance.userId, attendance.sessionId);
    }

    console.log(`🧹 Cleaned up ${oldActiveSessions.length} old sessions`);
  } catch (error) {
    console.error("❌ Cleanup error:", error);
  }
}

export {
  autoClockIn,
  autoClockOut,
  handleSessionTimeout,
  calculateHours,
  getTodayAttendance,
  getAttendanceHistory,
  getAttendanceStats,
  emitAttendanceUpdate,
  cleanupOldSessions,
};
