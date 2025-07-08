import { Company, User, Payment, Invite } from "../model/model.js";

// Delete a company (super admin only)
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findByPk(id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }
    // Optionally: delete related users, employees, etc. (cascade)
    await company.destroy();
    res.json({ success: true, message: "Company deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all companies (paginated)
export const getAllCompanies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { count, rows } = await Company.findAndCountAll({ offset, limit });
    res.json({ success: true, companies: rows, total: count, page, limit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all users (paginated)
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { count, rows } = await User.findAndCountAll({ offset, limit });
    res.json({ success: true, users: rows, total: count, page, limit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all payments (paginated)
export const getAllPayments = async (req, res) => {
  try {
    if (!Payment) return res.json({ success: true, payments: [] });
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { count, rows } = await Payment.findAndCountAll({ offset, limit });
    res.json({ success: true, payments: rows, total: count, page, limit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all invites (paginated)
export const getAllInvites = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { count, rows } = await Invite.findAndCountAll({ offset, limit });
    res.json({ success: true, invites: rows, total: count, page, limit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
