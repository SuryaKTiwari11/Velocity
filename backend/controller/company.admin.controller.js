import { Company, Employee, User } from "../model/model.js";

export const getCompanyUsage = async (req, res) => {
  try {
    const company = await Company.findByPk(req.user.companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    const employeeCount = await Employee.count({
      where: { companyId: company.companyId },
    });
   
    res.json({
      employeeCount,
      maxEmployees: company.maxEmployees,
      plan: company.companyPlan,
      usageStats: {},//! Placeholder for future usage stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// List Admins
export const listAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: {
        companyId: req.user.companyId,
        isAdmin: true,
      },
      attributes: ["id", "name", "email", "role", "createdAt"],
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({
      where: { id: userId, companyId: req.user.companyId },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.isAdmin = false;
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getSubscriptionStatus = async (req, res) => {
  try {
    const company = await Company.findByPk(req.user.companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.json({
      plan: company.companyPlan,
      renewalDate: company.renewalDate,
      status: company.status,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
