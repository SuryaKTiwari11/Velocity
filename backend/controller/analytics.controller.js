import { Op } from "sequelize";
import sequelize from "../configuration/db.js";

// Helper: Get last N months date
const getMonthsAgo = (n) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
};

// Helper: Group by month
const groupByMonth = (items, dateKey, label = "uploads") => {
  const monthly = {};
  items.forEach((i) => {
    const m = new Date(i[dateKey]).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    monthly[m] = (monthly[m] || 0) + 1;
  });
  return Object.entries(monthly).map(([month, count]) => ({ month, [label]: count }));
};

// Employee Stats
export const getEmployeeStats = async (req, res) => {
  try {
    const { Employee } = req.models;
    const cid = req.user.companyId;
    const total = await Employee.count({ where: { companyId: cid } });
    if (!total) {
      return res.json({
        success: true,
        data: {
          total: 0,
          salaryDist: [
            { range: "20k-30k", count: 0, pct: "0" },
            { range: "30k-50k", count: 0, pct: "0" },
            { range: "50k+", count: 0, pct: "0" },
          ],
          deptStats: [],
          monthlyHire: [],
        },
      });
    }
    const all = await Employee.findAll({ attributes: ["salary"], where: { companyId: cid }, raw: true });
    const salaryDist = [
      { range: "20k-30k", count: all.filter(e => (e.salary || 0) < 30000).length },
      { range: "30k-50k", count: all.filter(e => (e.salary || 0) >= 30000 && (e.salary || 0) <= 50000).length },
      { range: "50k+", count: all.filter(e => (e.salary || 0) > 50000).length },
    ].map(r => ({ ...r, pct: ((r.count / total) * 100).toFixed(1) }));

    const deptStatsRaw = await Employee.findAll({
      attributes: [
        "department",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("AVG", sequelize.col("salary")), "avgSalary"],
      ],
      where: { companyId: cid, department: { [Op.not]: null } },
      group: ["department"],
      raw: true,
    });
    const deptStats = deptStatsRaw.map(d => ({
      department: d.department || "Not Specified",
      count: +d.count,
      avgSalary: Math.round(+d.avgSalary || 0),
    }));

    const recent = await Employee.findAll({
      where: { companyId: cid, createdAt: { [Op.gte]: getMonthsAgo(6) } },
      attributes: ["createdAt"],
      raw: true,
    });
    const monthlyHire = groupByMonth(recent, "createdAt", "hired");

    res.json({
      success: true,
      data: { total, salaryDist, deptStats, monthlyHire },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee statistics",
      error: error.message,
    });
  }
};

// Document Stats
export const getDocumentStats = async (req, res) => {
  try {
    const { Document } = req.models;
    const companyId = req.user.companyId;
    const totalDocuments = await Document.count({ where: { companyId } });
    if (!totalDocuments) {
      return res.json({
        success: true,
        data: {
          totalDocuments: 0,
          typeDistribution: [
            { type: "PDF", count: 0, percentage: "0" },
            { type: "Image", count: 0, percentage: "0" },
            { type: "Document", count: 0, percentage: "0" },
            { type: "Other", count: 0, percentage: "0" },
          ],
          monthlyUploads: [],
          storageInfo: { totalFiles: 0, estimatedSize: "0 MB" },
        },
      });
    }
    const allDocuments = await Document.findAll({ attributes: ["fileName"], where: { companyId }, raw: true });
    const typeStats = { PDF: 0, Image: 0, Document: 0, Other: 0 };
    allDocuments.forEach(({ fileName = "" }) => {
      const f = fileName.toLowerCase();
      if (f.includes(".pdf")) typeStats.PDF++;
      else if ([".jpg", ".png", ".jpeg"].some(ext => f.includes(ext))) typeStats.Image++;
      else if ([".doc", ".docx"].some(ext => f.includes(ext))) typeStats.Document++;
      else typeStats.Other++;
    });
    const typeDistribution = Object.entries(typeStats).map(([type, count]) => ({
      type, count, percentage: ((count / totalDocuments) * 100).toFixed(1),
    }));

    const recentDocuments = await Document.findAll({
      where: { companyId, createdAt: { [Op.gte]: getMonthsAgo(6) } },
      attributes: ["createdAt"],
      raw: true,
    });
    const monthlyUploads = groupByMonth(recentDocuments, "createdAt");

    res.json({
      success: true,
      data: {
        totalDocuments,
        typeDistribution,
        monthlyUploads,
        storageInfo: {
          totalFiles: totalDocuments,
          estimatedSize: `${(totalDocuments * 1.5).toFixed(1)} MB`,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch document statistics",
      error: error.message,
    });
  }
};

// Revenue Stats
export const getRevenueStats = async (req, res) => {
  try {
    const { User } = req.models;
    const [premiumUsers, totalUsers] = await Promise.all([
      User.count({ where: { isPremium: true } }),
      User.count(),
    ]);
    if (!totalUsers) {
      return res.json({
        success: true,
        data: {
          totalRevenue: 0,
          premiumUsers: 0,
          totalUsers: 0,
          conversionRate: 0,
          monthlyRevenue: [],
          monthlyRegistrations: [],
          revenuePerUser: 999,
        },
      });
    }
    const conversionRate = ((premiumUsers / totalUsers) * 100).toFixed(1);
    const sixMonthsAgo = getMonthsAgo(6);

    const [recentPremiumUsers, recentRegistrations] = await Promise.all([
      User.findAll({
        where: { isPremium: true, updatedAt: { [Op.gte]: sixMonthsAgo } },
        attributes: ["updatedAt"],
        raw: true,
      }),
      User.findAll({
        where: { createdAt: { [Op.gte]: sixMonthsAgo } },
        attributes: ["createdAt"],
        raw: true,
      }),
    ]);

    const monthlyPremiumSignups = groupByMonth(recentPremiumUsers, "updatedAt", "newPremium");
    const revenuePerUser = 999;
    const monthlyRevenue = monthlyPremiumSignups.map(item => ({
      month: item.month,
      revenue: item.newPremium * revenuePerUser,
      users: item.newPremium,
    }));
    const totalRevenue = premiumUsers * revenuePerUser;
    const monthlyRegistrations = groupByMonth(recentRegistrations, "createdAt", "registrations");

    res.json({
      success: true,
      data: {
        totalRevenue,
        premiumUsers,
        totalUsers,
        conversionRate: parseFloat(conversionRate),
        monthlyRevenue,
        monthlyRegistrations,
        revenuePerUser,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch revenue statistics",
      error: error.message,
    });
  }
};

// Dashboard Data
export const getDashboardData = async (req, res) => {
  try {
    const { Employee, Document, User } = req.models;
    const [employeeCount, documentCount, userCount, premiumCount] = await Promise.all([
      Employee.count(),
      Document.count(),
      User.count(),
      User.count({ where: { isPremium: true } }),
    ]);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [newEmployees, newDocuments, newUsers] = await Promise.all([
      Employee.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      Document.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      User.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
    ]);
    res.json({
      success: true,
      data: {
        quickStats: {
          employees: employeeCount,
          documents: documentCount,
          users: userCount,
          premiumUsers: premiumCount,
        },
        recentActivity: {
          newEmployees,
          newDocuments,
          newUsers,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};
