import { Attendance, User } from "../model/model.js";
import { Op } from "sequelize";
import * as AttendanceService from "../services/attendanceService.js";
import { getSocket } from "../configuration/socket.js";

// Helper functions for consistent API responses
const sendSuccess = (res, data, message) => {
  res.json({ success: true, data, message });
};

const sendError = (res, message, statusCode = 500) => {
  res.status(statusCode).json({ success: false, message });
};

// Clock in functionality
export const clockIn = async (req, res) => {
  try {
    const { id: userId, companyId, name, email } = req.user;

    // Check if user is already clocked in today
    const existing = await AttendanceService.getTodayAttendance(userId);
    if (existing?.isActive) {
      return sendError(res, "Already clocked in today", 400);
    }

    // Create new attendance record
    const clockInTime = new Date();
    const attendance = await Attendance.create({
      userId,
      companyId,
      clockInTime,
      date: clockInTime.toISOString().split("T")[0],
      isActive: true,
      status: "present",
    });

    // Update Redis cache for real-time features
    await AttendanceService.addToRedisCache(userId, companyId, clockInTime, {
      name,
      email,
    });

    // Send real-time notification to admin dashboard
    AttendanceService.sendRealtimeUpdate(userId, companyId, "clock-in", {
      name,
      clockInTime: clockInTime.toISOString(),
    });

    sendSuccess(res, attendance, "Clocked in successfully");
  } catch (error) {
    console.error("Clock in error:", error);
    sendError(res, "Failed to clock in");
  }
};

// Clock out functionality
export const clockOut = async (req, res) => {
  try {
    const { id: userId, companyId, name } = req.user;

    // Get today's active attendance record
    const attendance = await AttendanceService.getTodayAttendance(userId);
    if (!attendance?.isActive) {
      return sendError(res, "Not currently clocked in", 400);
    }

    // Calculate total hours and update record
    const clockOutTime = new Date();
    const totalHours = AttendanceService.calculateHours(
      attendance.clockInTime,
      clockOutTime
    );

    await attendance.update({
      clockOutTime,
      totalHours,
      isActive: false,
    });

    // Remove from Redis cache
    await AttendanceService.removeFromRedisCache(userId, companyId);

    // Send real-time notification
    AttendanceService.sendRealtimeUpdate(userId, companyId, "clock-out", {
      name,
      totalHours: Math.round(totalHours * 100) / 100,
    });

    sendSuccess(res, { attendance, totalHours }, "Clocked out successfully");
  } catch (error) {
    console.error("Clock out error:", error);
    sendError(res, "Failed to clock out");
  }
};

// Get currently active users (Redis-cached for performance)
export const getActiveUsers = async (req, res) => {
  try {
    const { companyId } = req.user;

    // Try Redis cache first for better performance
    let activeUsers = await AttendanceService.getActiveUsersFromCache(
      companyId
    );

    // Fallback to database if Redis is empty
    if (activeUsers.length === 0) {
      const today = new Date().toISOString().split("T")[0];
      const dbUsers = await Attendance.findAll({
        where: { date: today, isActive: true, companyId },
        include: [{ model: User, attributes: ["name", "email"] }],
      });

      activeUsers = dbUsers.map((att) => ({
        userId: att.userId,
        name: att.User?.name || "Unknown User",
        email: att.User?.email || "",
        clockInTime: att.clockInTime,
        currentHours: AttendanceService.calculateHours(
          att.clockInTime,
          new Date()
        ),
      }));
    }

    res.json({
      success: true,
      data: activeUsers,
      count: activeUsers.length,
      message: "Active users retrieved successfully",
    });
  } catch (error) {
    console.error("Get active users error:", error);
    sendError(res, "Failed to get active users");
  }
};

// Get today's attendance for current user
export const getTodayAttendance = async (req, res) => {
  try {
    const attendance = await AttendanceService.getTodayAttendance(req.user.id);

    if (attendance?.isActive) {
      attendance.dataValues.currentHours = AttendanceService.calculateHours(
        attendance.clockInTime,
        new Date()
      );
    }

    sendSuccess(res, attendance, "Today's attendance retrieved successfully");
  } catch (error) {
    console.error("Get today attendance error:", error);
    sendError(res, "Failed to get today's attendance");
  }
};

// Get attendance history for current user
export const getAttendanceHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await AttendanceService.getAttendanceHistory(
      req.user.id,
      page,
      limit
    );

    res.json({
      success: true,
      data: result.attendance,
      pagination: result.pagination,
      message: "Attendance history retrieved successfully",
    });
  } catch (error) {
    console.error("Get attendance history error:", error);
    sendError(res, "Failed to get attendance history");
  }
};

// Get active user count (quick Redis lookup)
export const getActiveUserCount = async (req, res) => {
  try {
    const count = await AttendanceService.getActiveUserCount(
      req.user.companyId
    );

    res.json({
      success: true,
      data: { activeCount: count },
      message: "Active user count retrieved successfully",
    });
  } catch (error) {
    console.error("Get active user count error:", error);
    sendError(res, "Failed to get active user count");
  }
};

// Get all attendance records for admin dashboard
export const getAllAttendance = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { page = 1, limit = 20, date, userId } = req.query;

    const whereClause = { companyId };
    if (date) whereClause.date = date;
    if (userId) whereClause.userId = userId;

    const { count, rows } = await Attendance.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ["name", "email"],
        },
      ],
      order: [
        ["date", "DESC"],
        ["clockInTime", "DESC"],
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    const attendanceWithHours = rows.map((att) => ({
      id: att.id,
      userId: att.userId,
      name: att.User?.name || "Unknown User",
      email: att.User?.email || "",
      date: att.date,
      clockInTime: att.clockInTime,
      clockOutTime: att.clockOutTime,
      totalHours: att.totalHours || 0,
      status: att.isActive ? "Active" : "Completed",
    }));

    res.json({
      success: true,
      data: attendanceWithHours,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
      message: "All attendance records retrieved successfully",
    });
  } catch (error) {
    console.error("Get all attendance error:", error);
    sendError(res, "Failed to get attendance records");
  }
};

// Fix stale attendance records (users still marked as active from previous days)
export const fixStaleAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Find users still marked as "active" from previous days
    const staleRecords = await Attendance.findAll({
      where: {
        date: { [Op.lt]: today },
        isActive: true,
      },
    });

    // Auto clock-out at 6 PM on their original date
    for (const record of staleRecords) {
      const clockOutTime = new Date(record.date + "T18:00:00");
      const totalHours = (clockOutTime - record.clockInTime) / (1000 * 60 * 60);

      await record.update({
        clockOutTime,
        totalHours: Math.min(totalHours, 12), // Cap at 12 hours maximum
        isActive: false,
      });
    }

    res.json({
      success: true,
      data: { fixedRecords: staleRecords.length },
      message: `Fixed ${staleRecords.length} stale attendance records`,
    });
  } catch (error) {
    console.error("Fix stale attendance error:", error);
    sendError(res, "Failed to fix stale attendance records");
  }
};

export default {
  clockIn,
  clockOut,
  getActiveUsers,
  getTodayAttendance,
  getAttendanceHistory,
  getActiveUserCount,
  getAllAttendance,
  fixStaleAttendance,
};
