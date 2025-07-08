import jwt from "jsonwebtoken";
import { Company, Employee } from "../model/model.js";
import { configDotenv } from "dotenv";
configDotenv();
const key = process.env.JWT_SECRET;

export const authenticateCompany = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token is required" });
    }
    const decoded = jwt.verify(token, key);
    if (!decoded || !decoded.companyCode) {
      return res
        .status(401)
        .json({ message: "Invalid or expired authentication token" });
    }
    // Use companyCode for lookup, match model field name
    const company = await Company.findOne({
      where: { companyCode: decoded.companyCode },
    });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    req.user = {
      id: decoded.userId, 
      companyId: decoded.companyId,
    };
    req.company = company;
    next();
  } catch (error) {
    console.error("Error in authenticateCompany:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkEmployeeLimit = async (req, res, next) => {
  try {
    const currentCount = await Employee.count({
      where: { companyId: req.user.companyId },
    });

    if (currentCount >= req.company.maxEmployees) {
      return res.status(403).json({
        message: `Employee limit reached! You can only have ${req.company.maxEmployees} employees on the ${req.company.companyPlan} plan.`,
        upgrade_needed: true,
      });
    }
    next();
  } catch (error) {
    console.error("Error checking employee limit:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
