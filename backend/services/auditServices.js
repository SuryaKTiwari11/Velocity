import { AuditLog, User, LoginHistory } from "../model/model.js";
const getClientIP = (req) => {
  // Prefer x-forwarded-for, then connection/socket, then req.ip, then unknown
  if (!req) return "unknown";
  const xff = req.headers && req.headers["x-forwarded-for"];
  if (xff) {
    const ips = xff
      .split(",")
      .map((ip) => ip.trim())
      .filter(Boolean);
    if (ips.length > 0) return ips[0];
  }
  if (req.connection && req.connection.remoteAddress)
    return req.connection.remoteAddress;
  if (req.socket && req.socket.remoteAddress) return req.socket.remoteAddress;
  if (req.ip) return req.ip;
  return "unknown";
};

const logAction = async (
  userId,
  action,
  tableName,
  recordId,
  oldData,
  newData,
  req
) => {
  try {
    if (!userId || !action || !tableName || !recordId) {
      throw new Error("Missing required parameters for logging action");
    }
    const ip = getClientIP(req);

    // Always set companyId from req.user if available
    let companyId = null;
    if (req && req.user && req.user.companyId) {
      companyId = req.user.companyId;
    }
    await AuditLog.create({
      userId,
      action,
      tableName,
      recordId,
      oldData: oldData ? JSON.stringify(oldData) : null,
      newData: newData ? JSON.stringify(newData) : null,
      ipAddress: ip,
      companyId,
    });
  } catch (error) {
    console.error("Error logging action:", error);
    throw error;
  }
};

const getUserActivity = async (userId, limit = 20) => {
  try {
    const activities = await AuditLog.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: limit,
      include: [
        {
          model: User,
          attributes: ["name", "email"],
          required: false,
        },
      ],
    });

    return activities;
  } catch (error) {
    console.error(" Failed to get user activity:", error.message);
    return [];
  }
};

const logLogin = async (
  email,
  success,
  userId = null,
  req = null,
  failureReason = null
) => {
  try {
    const ip = req ? getClientIP(req) : null;

    // Always set companyId from req.user if available
    let companyId = null;
    if (req && req.user && req.user.companyId) {
      companyId = req.user.companyId;
    }
    await LoginHistory.create({
      userId,
      email: email,
      success: success,
      ip_address: ip,
      failure_reason: failureReason,
      companyId,
    });

    console.log(`🔐 Login ${success ? "SUCCESS" : "FAILED"} for ${email}`);
  } catch (error) {
    console.error("❌ Failed to log login:", error.message);
  }
};
export { getClientIP, logAction, getUserActivity, logLogin };
