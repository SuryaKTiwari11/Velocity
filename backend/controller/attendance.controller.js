import { Attendance, User } from "../model/model.js";
import * as AttendanceService from "../services/attendanceService.js";
export const getTodayAttendance = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const attendance = await AttendanceService.getTodayAttendance(req.user.id);
    if (!attendance) {
      return res.json({
        success: true,
        data: null,
        message: "No attendance record for today",
      });
    }
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
    res.status(500).json({
      success: false,
      message: "Failed to get today's attendance",
      error: error.message,
    });
  }
};

export const getAttendanceHistory = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
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
      message: "Attendance history retrieved",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get attendance history",
      error: error.message,
    });
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const { page = 1, limit = 20, date, userId } = req.query;
    const offset = (page - 1) * limit;
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
    res.status(500).json({
      success: false,
      message: "Failed to get all attendance records",
      error: error.message,
    });
  }
};

export const getActiveUsers = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
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
    res.status(500).json({
      success: false,
      message: "Failed to get active users",
      error: error.message,
    });
  }
};

export const getAttendanceStats = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
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
    res.status(500).json({
      success: false,
      message: "Failed to get attendance stats",
      error: error.message,
    });
  }
};

export default {
  getTodayAttendance,
  getAttendanceHistory,
  getAllAttendance,
  getActiveUsers,
  getAttendanceStats,
};
