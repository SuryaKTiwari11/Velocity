import { Company, User } from "../model/model.js";
import bcrypt from "bcryptjs";

export const registerCompany = async (req, res) => {
  try {
    const { companyName, companyCode, adminName, adminEmail, adminPassword } =
      req.body;
    // Validate input
    if (
      !companyName ||
      !companyCode ||
      !adminName ||
      !adminEmail ||
      !adminPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Company name, code, admin name, admin email, and admin password are required",
      });
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({
      where: { companyCode: companyCode.toLowerCase() },
    });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: "Company with this code already exists",
      });
    }

    // Create new company
    const newCompany = await Company.create({
      companyName,
      companyCode: companyCode.toLowerCase(),
      companyPlan: "free",
      maxEmployees: 10,
    });

    // Hash admin password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create admin user for the company
    await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      companyId: newCompany.companyId,
      isAdmin: true,
      isVerified: true,
    });

    res.status(201).json({
      success: true,
      data: newCompany,
      message: "Company registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
