// Attendance Controller - Automatic tracking via login/logout
// No manual clock-in/clock-out needed!

import { Attendance, User, Employee } from "../model/model.js";
import { Op } from "sequelize";
import { logAction } from "../services/auditServices.js";
import * as AttendanceService from "../services/attendanceService.js";
// Get today's attendance - matches frontend: today: () => api.get("/attendance/today")
export const getTodayAttendance = async (req, res) => {
  try {
    console.log("📅 Getting today's attendance for user:", req.user.id);

    const attendance = await AttendanceService.getTodayAttendance(req.user.id);

    if (!attendance) {
      return res.json({
        success: true,
        data: null,
        message: "No attendance record for today",
      });
    }

    // Calculate current working hours if still active
    if (attendance.isActive) {
      const currentHours = AttendanceService.calculateHours(
        attendance.clockInTime,
        new Date()
      );
      attendance.dataValues.currentHours = currentHours;
    }

    res.json({
      success: true,
      data: attendance,
      message: "Today's attendance retrieved",
    });
  } catch (error) {
    console.error("❌ Get today attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get today's attendance",
      error: error.message,
    });
  }
};

// Get attendance history - matches frontend: history: (params) => api.get("/attendance/history", { params })
export const getAttendanceHistory = async (req, res) => {
  try {
    console.log("📋 Getting attendance history for user:", req.user.id);

    const { page = 1, limit = 10, startDate, endDate } = req.query;

    const result = await AttendanceService.getAttendanceHistory(
      req.user.id,
      page,
      limit
    );

    res.json({
      success: true,
      data: result.attendance,
      pagination: result.pagination,
      message: "Attendance history retrieved",
    });
  } catch (error) {
    console.error("❌ Get attendance history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get attendance history",
      error: error.message,
    });
  }
};

// LEGACY ENDPOINTS (for backward compatibility)

// Legacy clock in - explains automatic tracking
export const clockIn = async (req, res) => {
  try {
    const attendance = await AttendanceService.getTodayAttendance(req.user.id);

    if (attendance && attendance.isActive) {
      return res.json({
        success: true,
        data: attendance,
        message:
          "✨ You're already clocked in automatically! Attendance is tracked when you login.",
      });
    } else {
      return res.json({
        success: false,
        message: "⚠️ Please log in to automatically start attendance tracking.",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Legacy clock out - explains automatic tracking
export const clockOut = async (req, res) => {
  try {
    const attendance = await AttendanceService.getTodayAttendance(req.user.id);

    if (attendance && attendance.isActive) {
      return res.json({
        success: true,
        data: attendance,
        message:
          "✨ You're currently clocked in! Logout to automatically clock out.",
      });
    } else {
      return res.json({
        success: true,
        message: "✨ Attendance tracking is automatic - logout to clock out.",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Legacy getToday - redirect to new endpoint
export const getToday = async (req, res) => {
  return getTodayAttendance(req, res);
};

// Legacy getHistory - redirect to new endpoint
export const getHistory = async (req, res) => {
  return getAttendanceHistory(req, res);
};

// Admin: Get all users' attendance
export const getAllAttendance = async (req, res) => {
  try {
    console.log("👩‍💼 Admin getting all attendance");

    const { page = 1, limit = 20, date, userId } = req.query;
    const offset = (page - 1) * limit;

    // Enforce company-level data separation
    const companyId = req.user.companyId;
    const whereCondition = { companyId };
    if (date) whereCondition.date = date;
    if (userId) whereCondition.userId = userId;

    const { count, rows } = await Attendance.findAndCountAll({
      where: whereCondition,
      order: [
        ["date", "DESC"],
        ["clockInTime", "DESC"],
      ],
      limit: parseInt(limit),
      offset,
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
          where: { companyId },
        },
      ],
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
        recordsPerPage: limit,
      },
      message: "All attendance records retrieved",
    });
  } catch (error) {
    console.error("❌ Get all attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get all attendance records",
      error: error.message,
    });
  }
};

// Get current active users (who are logged in)
export const getActiveUsers = async (req, res) => {
  try {
    console.log("👥 Getting currently active users");

    const today = new Date().toISOString().split("T")[0];
    const companyId = req.user.companyId;
    const activeUsers = await Attendance.findAll({
      where: {
        date: today,
        isActive: true,
        companyId,
      },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
          where: { companyId },
        },
      ],
      order: [["clockInTime", "ASC"]],
    });

    // Calculate current working hours for each active user
    const usersWithHours = activeUsers.map((attendance) => {
      const currentHours = AttendanceService.calculateHours(
        attendance.clockInTime,
        new Date()
      );
      return {
        ...attendance.dataValues,
        currentHours,
      };
    });

    res.json({
      success: true,
      data: usersWithHours,
      count: usersWithHours.length,
      message: "Active users retrieved",
    });
  } catch (error) {
    console.error("❌ Get active users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get active users",
      error: error.message,
    });
  }
};

// Get attendance stats - matches frontend API
export const getAttendanceStats = async (req, res) => {
  try {
    console.log("📊 Getting attendance stats for user:", req.user.id);

    const { startDate, endDate } = req.query;

    const stats = await AttendanceService.getAttendanceStats(
      req.user.id,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: stats,
      message: "Attendance stats retrieved",
    });
  } catch (error) {
    console.error("❌ Get attendance stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get attendance stats",
      error: error.message,
    });
  }
};
