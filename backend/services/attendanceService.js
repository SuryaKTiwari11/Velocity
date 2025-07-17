import { Attendance, User } from "../model/model.js";
import { Op } from "sequelize";
import { io } from "../index.js";

// FIXED: autoClockIn now requires companyId and always sets it
async function autoClockIn(
  userId,
  sessionId,
  ipAddress = null,
  companyId = null
) {
  try {
    const today = new Date().toISOString().split("T")[0];

    const existing = await Attendance.findOne({
      where: { userId, date: today },
    });

    if (existing) {
      if (existing.isActive) {
        await existing.update({ sessionId });
        // User already clocked in, session updated
        return existing;
      } else {
        const clockInTime = new Date();
        await existing.update({
          clockInTime,
          isActive: true,
          sessionId,
          clockOutTime: null,
          totalHours: 0,
        });
        emitAttendanceUpdate(userId, "clock-in", existing);
        // User clocked in again
        return existing;
      }
    }

    // New clock in
    const attendance = await Attendance.create({
      userId,
      companyId, // Ensure companyId is always set
      clockInTime: new Date(),
      date: today,
      isActive: true,
      sessionId,
      ipAddress,
      status: "present",
    });

    emitAttendanceUpdate(userId, "clock-in", attendance);
    // User clocked in
    return attendance;
  } catch (err) {
    console.error("Clock-in error:", err);
    throw err;
  }
}

async function autoClockOut(userId, sessionId = null) {
  try {
    const today = new Date().toISOString().split("T")[0];
    let attendance = null;

    if (sessionId) {
      attendance = await Attendance.findOne({
        where: { userId, date: today, isActive: true, sessionId },
      });
    }
    if (!attendance) {
      attendance = await Attendance.findOne({
        where: { userId, date: today, isActive: true },
      });
    }

    if (!attendance) {
      // No active attendance for user
      return null;
    }

    const clockOutTime = new Date();
    const totalHours = calculateHours(attendance.clockInTime, clockOutTime);

    await attendance.update({
      clockOutTime,
      totalHours,
      isActive: false,
    });

    emitAttendanceUpdate(userId, "clock-out", attendance);
    // User clocked out
    return attendance;
  } catch (err) {
    console.error("Clock-out error:", err);
    throw err;
  }
}

async function handleSessionTimeout(sessionId) {
  try {
    const attendance = await Attendance.findOne({
      where: { sessionId, isActive: true },
    });

    if (attendance) {
      await autoClockOut(attendance.userId, sessionId);
      // Session timeout for user
    }
  } catch (err) {
    console.error("Session timeout error:", err);
  }
}

function calculateHours(clockIn, clockOut) {
  const diffMs = new Date(clockOut) - new Date(clockIn);
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.round(diffHours * 100) / 100;
}

async function getTodayAttendance(userId) {
  try {
    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({
      where: { userId, date: today },
      include: [{ model: User, attributes: ["id", "name", "email"] }],
    });

    return attendance;
  } catch (err) {
    console.error("Get today attendance error:", err);
    throw err;
  }
}
async function getAttendanceHistory(userId, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;

    const { count, rows } = await Attendance.findAndCountAll({
      where: { userId },
      order: [["date", "DESC"]],
      limit: parseInt(limit),
      offset,
      include: [{ model: User, attributes: ["id", "name", "email"] }],
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
  } catch (err) {
    console.error("Get attendance history error:", err);
    throw err;
  }
}

async function getAttendanceStats(userId, startDate = null, endDate = null) {
  try {
    const whereCondition = { userId };

    if (startDate && endDate) {
      whereCondition.date = { [Op.between]: [startDate, endDate] };
    } else {
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
  } catch (err) {
    console.error("Get attendance stats error:", err);
    throw err;
  }
}

// Send attendance updates to clients
function emitAttendanceUpdate(userId, action, attendanceData) {
  try {
    if (io) {
      io.to(`user_${userId}`).emit("attendance_update", {
        action,
        data: attendanceData,
        timestamp: new Date(),
      });

      io.to("admin_room").emit("user_attendance_update", {
        userId,
        action,
        data: attendanceData,
        timestamp: new Date(),
      });
    }
  } catch (err) {
    console.error("WebSocket emit error:", err);
  }
}

// Clean up old sessions
async function cleanupOldSessions() {
  try {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const oldActiveSessions = await Attendance.findAll({
      where: {
        isActive: true,
        clockInTime: { [Op.lt]: cutoffTime },
      },
    });

    for (const attendance of oldActiveSessions) {
      await autoClockOut(attendance.userId, attendance.sessionId);
    }

    // Cleaned up old sessions
  } catch (err) {
    console.error("Cleanup error:", err);
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
