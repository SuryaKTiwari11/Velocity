import { Attendance, User } from "../model/model.js";
import { Op } from "sequelize";
import { io } from "../index.js";
import redisClient from "../configuration/redis.js";

// Calculate hours between two timestamps
export function calculateHours(clockIn, clockOut) {
  const diffMs = new Date(clockOut) - new Date(clockIn);
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.round(diffHours * 100) / 100;
}

// Get today's attendance for a specific user
export async function getTodayAttendance(userId) {
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

// Get attendance history with pagination
export async function getAttendanceHistory(userId, page = 1, limit = 10) {
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

// Auto clock-in for SSO authentication
export async function autoClockIn(
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
        return existing;
      }
    }

    // Create new attendance record
    const attendance = await Attendance.create({
      userId,
      companyId,
      clockInTime: new Date(),
      date: today,
      isActive: true,
      sessionId,
      ipAddress,
      status: "present",
    });
    return attendance;
  } catch (err) {
    console.error("Auto clock-in error:", err);
    throw err;
  }
}

// Redis cache functions
const REDIS_KEYS = {
  ACTIVE_USERS: (companyId) => `active_users:${companyId}`,
  USER_SESSION: (userId) => `user_session:${userId}`,
  USER_COUNT: (companyId) => `active_count:${companyId}`,
};

export async function addToRedisCache(
  userId,
  companyId,
  clockInTime,
  userInfo
) {
  try {
    const sessionData = {
      userId: userId.toString(),
      companyId: companyId.toString(),
      name: userInfo.name,
      email: userInfo.email,
      clockInTime: clockInTime.toISOString(),
    };

    const pipeline = redisClient.pipeline();
    pipeline.sadd(REDIS_KEYS.ACTIVE_USERS(companyId), userId.toString());
    pipeline.hmset(REDIS_KEYS.USER_SESSION(userId), sessionData);
    pipeline.expire(REDIS_KEYS.USER_SESSION(userId), 24 * 60 * 60);
    pipeline.incr(REDIS_KEYS.USER_COUNT(companyId));
    await pipeline.exec();
    return true;
  } catch (error) {
    console.error("Redis cache add error:", error);
    return false;
  }
}

export async function removeFromRedisCache(userId, companyId) {
  try {
    const pipeline = redisClient.pipeline();
    pipeline.srem(REDIS_KEYS.ACTIVE_USERS(companyId), userId.toString());
    pipeline.del(REDIS_KEYS.USER_SESSION(userId));
    pipeline.decr(REDIS_KEYS.USER_COUNT(companyId));
    await pipeline.exec();
    return true;
  } catch (error) {
    console.error("Redis cache remove error:", error);
    return false;
  }
}

export async function getActiveUsersFromCache(companyId) {
  try {
    const userIds = await redisClient.smembers(
      REDIS_KEYS.ACTIVE_USERS(companyId)
    );
    if (!userIds.length) return [];

    const pipeline = redisClient.pipeline();
    userIds.forEach((id) => pipeline.hgetall(REDIS_KEYS.USER_SESSION(id)));
    const results = await pipeline.exec();
    const activeUsers = [];

    results.forEach(([err, sessionData]) => {
      if (!err && sessionData && sessionData.name) {
        const clockInTime = new Date(sessionData.clockInTime);
        const currentHours = calculateHours(clockInTime, new Date());
        activeUsers.push({
          userId: parseInt(sessionData.userId),
          name: sessionData.name,
          email: sessionData.email,
          clockInTime,
          currentHours: Math.round(currentHours * 100) / 100,
          status: "online",
        });
      }
    });

    activeUsers.sort((a, b) => a.clockInTime - b.clockInTime);
    return activeUsers;
  } catch (error) {
    console.error("Redis get active users error:", error);
    return [];
  }
}

export async function getActiveUserCount(companyId) {
  try {
    const count = await redisClient.get(REDIS_KEYS.USER_COUNT(companyId));
    return count ? Math.max(0, parseInt(count)) : 0;
  } catch (error) {
    console.error("Redis count error:", error);
    return 0;
  }
}

// Send real-time updates
export function sendRealtimeUpdate(userId, companyId, action, data) {
  try {
    if (io) {
      io.to(`user_${userId}`).emit("attendance_update", {
        action,
        data,
        timestamp: new Date(),
      });
      io.to(`company_${companyId}`).emit("user_attendance_update", {
        userId,
        action,
        data,
        timestamp: new Date(),
      });
    }
  } catch (err) {
    console.error("WebSocket error:", err);
  }
}

// Cleanup functions
export async function cleanupStaleAttendance() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const staleRecords = await Attendance.findAll({
      where: { date: { [Op.lt]: today }, isActive: true },
    });

    for (const record of staleRecords) {
      const estimatedClockOut = new Date(record.date + "T18:00:00");
      const totalHours = calculateHours(record.clockInTime, estimatedClockOut);
      await record.update({
        clockOutTime: estimatedClockOut,
        totalHours,
        isActive: false,
      });
    }
    return staleRecords.length;
  } catch (error) {
    console.error("Error cleaning up stale attendance:", error);
    return 0;
  }
}

export async function cleanupRedisOnStartup() {
  try {
    const allSessions = await redisClient.keys("user_session:*");
    for (const sessionKey of allSessions) {
      const userId = sessionKey.split(":")[1];
      const attendance = await getTodayAttendance(parseInt(userId));
      if (!attendance || !attendance.isActive) {
        const session = await redisClient.hgetall(sessionKey);
        if (session.companyId) {
          await removeFromRedisCache(
            parseInt(userId),
            parseInt(session.companyId)
          );
        }
      }
    }
  } catch (error) {
    console.error("Redis cleanup error:", error);
  }
}
