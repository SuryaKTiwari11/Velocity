import { Op } from "sequelize";
import sequelize from "../configuration/db.js";

// Get employee statistics
export const getEmployeeStats = async (req, res) => {
  try {
    const { Employee } = req.models;
    const companyId = req.user.companyId;
    // Simple count first to test
    const totalEmployees = await Employee.count({ where: { companyId } });

    // If no employees exist, return sample data
    if (totalEmployees === 0) {
      return res.json({
        success: true,
        data: {
          totalEmployees: 0,
          salaryDistribution: [
            { range: "20k-30k", count: 0, percentage: "0" },
            { range: "30k-50k", count: 0, percentage: "0" },
            { range: "50k+", count: 0, percentage: "0" },
          ],
          departmentStats: [],
          monthlyHiring: [],
        },
      });
    }

    // Salary distribution - simplified approach
    const allEmployees = await Employee.findAll({
      attributes: ["salary"],
      where: { companyId },
      raw: true,
    });

    // Calculate salary ranges manually (easier for students to understand)
    const salaryRanges = [
      { range: "20k-30k", count: 0 },
      { range: "30k-50k", count: 0 },
      { range: "50k+", count: 0 },
    ];

    allEmployees.forEach((emp) => {
      const salary = emp.salary || 0;
      if (salary < 30000) {
        salaryRanges[0].count++;
      } else if (salary >= 30000 && salary <= 50000) {
        salaryRanges[1].count++;
      } else {
        salaryRanges[2].count++;
      }
    });

    // Calculate percentages for salary distribution
    const salaryDistribution = salaryRanges.map((range) => ({
      range: range.range,
      count: range.count,
      percentage:
        totalEmployees > 0
          ? ((range.count / totalEmployees) * 100).toFixed(1)
          : 0,
    }));

    // Department-wise breakdown - simplified
    const departmentStats = await Employee.findAll({
      attributes: [
        "department",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("AVG", sequelize.col("salary")), "avgSalary"],
      ],
      where: {
        companyId,
        department: {
          [Op.not]: null,
        },
      },
      group: ["department"],
      raw: true,
    });

    // Monthly hiring trends (simplified - last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentEmployees = await Employee.findAll({
      where: {
        companyId,
        createdAt: {
          [Op.gte]: sixMonthsAgo,
        },
      },
      attributes: ["createdAt"],
      raw: true,
    });

    // Process monthly data manually (easier to understand)
    const monthlyData = {};
    recentEmployees.forEach((emp) => {
      const month = new Date(emp.createdAt).toLocaleDateString("en-US", {
        month: "short",
      });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    const monthlyHiring = Object.entries(monthlyData).map(([month, hired]) => ({
      month,
      hired,
    }));

    res.json({
      success: true,
      data: {
        totalEmployees,
        salaryDistribution,
        departmentStats: departmentStats.map((dept) => ({
          department: dept.department || "Not Specified",
          count: parseInt(dept.count),
          avgSalary: Math.round(parseFloat(dept.avgSalary) || 0),
        })),
        monthlyHiring,
      },
    });
  } catch (error) {
    console.error("Employee stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee statistics",
      error: error.message,
    });
  }
};

// Get document statistics
export const getDocumentStats = async (req, res) => {
  try {
    const { Document } = req.models;
    const companyId = req.user.companyId;
    // Simple count first to test
    const totalDocuments = await Document.count({ where: { companyId } });

    // If no documents exist, return sample data
    if (totalDocuments === 0) {
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
          storageInfo: {
            totalFiles: 0,
            estimatedSize: "0 MB",
          },
        },
      });
    }

    // Document type distribution - simplified
    const allDocuments = await Document.findAll({
      attributes: ["fileName"],
      where: { companyId },
      raw: true,
    });

    // Calculate file types manually
    const typeStats = {
      PDF: 0,
      Image: 0,
      Document: 0,
      Other: 0,
    };

    allDocuments.forEach((doc) => {
      const fileName = (doc.fileName || "").toLowerCase();
      if (fileName.includes(".pdf")) {
        typeStats.PDF++;
      } else if (
        fileName.includes(".jpg") ||
        fileName.includes(".png") ||
        fileName.includes(".jpeg")
      ) {
        typeStats.Image++;
      } else if (fileName.includes(".doc") || fileName.includes(".docx")) {
        typeStats.Document++;
      } else {
        typeStats.Other++;
      }
    });

    const typeDistribution = Object.entries(typeStats).map(([type, count]) => ({
      type,
      count,
      percentage:
        totalDocuments > 0 ? ((count / totalDocuments) * 100).toFixed(1) : 0,
    }));

    // Monthly upload trends - simplified
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentDocuments = await Document.findAll({
      where: {
        companyId,
        createdAt: {
          [Op.gte]: sixMonthsAgo,
        },
      },
      attributes: ["createdAt"],
      raw: true,
    });

    // Process monthly uploads manually
    const monthlyUploadsData = {};
    recentDocuments.forEach((doc) => {
      const month = new Date(doc.createdAt).toLocaleDateString("en-US", {
        month: "short",
      });
      monthlyUploadsData[month] = (monthlyUploadsData[month] || 0) + 1;
    });

    const monthlyUploads = Object.entries(monthlyUploadsData).map(
      ([month, uploads]) => ({
        month,
        uploads,
      })
    );

    res.json({
      success: true,
      data: {
        totalDocuments,
        typeDistribution,
        monthlyUploads,
        storageInfo: {
          totalFiles: totalDocuments,
          estimatedSize: `${(totalDocuments * 1.5).toFixed(1)} MB`, // Simple estimation
        },
      },
    });
  } catch (error) {
    console.error("Document stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch document statistics",
      error: error.message,
    });
  }
};

// Get revenue analytics
export const getRevenueStats = async (req, res) => {
  try {
    const { User } = req.models;

    // Simple counts first to test
    const premiumUsers = await User.count({
      where: {
        isPremium: true,
      },
    });

    const totalUsers = await User.count();

    // If no users exist, return sample data
    if (totalUsers === 0) {
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
    const conversionRate =
      totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : 0;

    // Monthly premium user trends - simplified
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentPremiumUsers = await User.findAll({
      where: {
        isPremium: true,
        updatedAt: {
          [Op.gte]: sixMonthsAgo,
        },
      },
      attributes: ["updatedAt"],
      raw: true,
    });

    // Process monthly premium signups manually
    const monthlyPremiumData = {};
    recentPremiumUsers.forEach((user) => {
      const month = new Date(user.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      monthlyPremiumData[month] = (monthlyPremiumData[month] || 0) + 1;
    });

    const monthlyPremiumSignups = Object.entries(monthlyPremiumData).map(
      ([month, newPremium]) => ({
        month,
        newPremium: parseInt(newPremium),
      })
    );

    // Simulate revenue data (since you might not have actual payment amounts stored)
    const revenuePerUser = 999; // Assuming ₹999 per premium subscription
    const monthlyRevenue = monthlyPremiumSignups.map((item) => ({
      month: item.month,
      revenue: item.newPremium * revenuePerUser,
      users: item.newPremium,
    }));

    // Calculate total revenue
    const totalRevenue = premiumUsers * revenuePerUser;

    // User registration trends - simplified
    const recentRegistrations = await User.findAll({
      where: {
        createdAt: {
          [Op.gte]: sixMonthsAgo,
        },
      },
      attributes: ["createdAt"],
      raw: true,
    });

    // Process monthly registrations manually
    const monthlyRegData = {};
    recentRegistrations.forEach((user) => {
      const month = new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
      });
      monthlyRegData[month] = (monthlyRegData[month] || 0) + 1;
    });

    const monthlyRegistrations = Object.entries(monthlyRegData).map(
      ([month, registrations]) => ({
        month,
        registrations,
      })
    );

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
    console.error("Revenue stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch revenue statistics",
      error: error.message,
    });
  }
};

// Get combined dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const { Employee, Document, User } = req.models;

    // Quick stats for dashboard cards
    const [employeeCount, documentCount, userCount, premiumCount] =
      await Promise.all([
        Employee.count(),
        Document.count(),
        User.count(),
        User.count({ where: { isPremium: true } }),
      ]);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await Promise.all([
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
          newEmployees: recentActivity[0],
          newDocuments: recentActivity[1],
          newUsers: recentActivity[2],
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};
