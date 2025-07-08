import { AuditLog, LoginHistory, User } from "../model/model.js";
import { Op } from "sequelize";

// Get audit logs - matches frontend: getLogs: (params) => api.get("/audit/logs", { params })
export const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, tableName, userId } = req.query;

    const whereCondition = { companyId: req.user.companyId };
    if (action) whereCondition.action = action;
    if (tableName) whereCondition.tableName = tableName;
    if (userId) whereCondition.userId = userId;

    const offset = (page - 1) * limit;
    const { count, rows } = await AuditLog.findAndCountAll({
      where: whereCondition,
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get audit logs",
      error: error.message,
    });
  }
};

// Get login history - matches frontend: getLoginHistory: (params) => api.get("/audit/login-history", { params })
export const getLoginHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, success } = req.query;

    const whereCondition = { companyId: req.user.companyId };
    if (userId) whereCondition.userId = userId;
    if (success !== undefined) whereCondition.success = success === "true";

    const offset = (page - 1) * limit;
    const { count, rows } = await LoginHistory.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],
      order: [["login_time", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get login history",
      error: error.message,
    });
  }
};

// Get audit stats - matches frontend: getStats: (params) => api.get("/audit/stats", { params })
export const getStats = async (req, res) => {
  try {
    const totalLogs = await AuditLog.count();
    const totalLogins = await LoginHistory.count();
    const successfulLogins = await LoginHistory.count({
      where: { success: true },
    });

    const actionStats = await AuditLog.findAll({
      attributes: [
        "action",
        [
          AuditLog.sequelize.fn("COUNT", AuditLog.sequelize.col("action")),
          "count",
        ],
      ],
      group: ["action"],
      order: [[AuditLog.sequelize.literal("count"), "DESC"]],
    });

    res.json({
      success: true,
      data: {
        totalLogs,
        totalLogins,
        successfulLogins,
        failedLogins: totalLogins - successfulLogins,
        actionBreakdown: actionStats.map((stat) => ({
          action: stat.action,
          count: parseInt(stat.dataValues.count),
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get audit stats",
      error: error.message,
    });
  }
};
