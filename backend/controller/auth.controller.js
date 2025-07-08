import { User, Employee, Company } from "../model/model.js";
import bcrypt from "bcryptjs";
import { genToken } from "../helper/genToken.js";
import jwt from "jsonwebtoken";
import { sendOTP } from "../helper/otpService.js";
import { getClientIP, logAction, logLogin } from "../services/auditServices.js";
import * as AttendanceService from "../services/attendanceService.js";
import { where } from "sequelize";

const userRes = (usr) => ({
  id: usr.id,
  name: usr.name,
  email: usr.email,
  isAdmin: usr.isAdmin,
  isVerified: usr.isVerified,
  profilePicture: usr.profilePicture,
  onboardingStatus: usr.onboardingStatus,
  isTrainingVideoDone: usr.isTrainingVideoDone,
  isDocumentSubmitted: usr.isDocumentSubmitted,
  isDocumentsApproved: usr.isDocumentsApproved,
  videoProgress: usr.videoProgress,
});

export const signUp = async (req, res) => {
  try {
    const { name, email, password, city } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, err: "missing creds" });

    const usr = await User.findOne({ where: { email } });
    if (usr) {
      return res
        .status(400)
        .json({ success: false, err: "email already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      password: hashed,
      isVerified: false,
      city: city || "delhi",
    });

    Employee.create({
      name,
      email,
      position: "not assigned yet",
      department: "not assigned yet",
      salary: 0,
    }).catch(() => {});

    const token = genToken(user.id, res);

    sendOTP(email).catch(() => {});

    await logAction(user.id, "CREATE", "User", user.id, null, user, req);

    res.status(201).json({
      success: true,
      msg: "user created",
      user: userRes(user),
      token,
      verificationRequired: true,
    });
  } catch (err) {
    res.status(500).json({ success: false, err: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, companyCode } = req.body;
    if (!email || !password || !companyCode) {
      return res
        .status(400)
        .json({ success: false, err: "need email and pass" });
    }
    const company = await Company.findOne({
      where: {
        companyCode: companyCode.toLowerCase(),
      },
    });
    if (!company) {
      return res
        .status(400)
        .json({ success: false, err: "invalid company code" });
    }

    const usr = await User.findOne({ where: { email } });
    if (!usr) {
      await logLogin(email, false, null, req, "User not found");
      return res.status(404).json({ success: false, err: "no user found" });
    }

    const match = await bcrypt.compare(password, usr.password);
    if (!match) {
      await logLogin(email, false, usr.id, req, "Wrong password");
      return res.status(401).json({ success: false, err: "wrong password" });
    }

    if (!usr.isVerified && !usr.googleId && !usr.githubId) {
      return res.status(403).json({
        success: false,
        err: "plz verify ur email first",
        needsVerification: true,
        email: usr.email,
      });
    }

    const token = genToken(usr.id, company.companyCode, company.companyId, res);

    await logLogin(email, true, usr.id, req);

    try {
      const sessionId = req.sessionID || token;
      const ipAddress = getClientIP(req);
      await AttendanceService.autoClockIn(usr.id, sessionId, ipAddress);
    } catch {}

    res.status(200).json({
      success: true,
      msg: "login ok",
      user: userRes(usr),
      companyCode: company.companyCode,
      companyId: company.companyId,
      token,
    });
  } catch (err) {
    res.status(500).json({ success: false, err: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies?.jwt;
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userID;
        await logAction(
          decoded.userID,
          "LOGOUT",
          "User",
          decoded.userID,
          null,
          null,
          req
        );
      } catch {}
    }

    if (!userId && req.user) {
      userId = req.user.id;
    }

    if (userId) {
      try {
        const sessionId = req.sessionID || token;
        await AttendanceService.autoClockOut(userId, sessionId);
      } catch {}
    }

    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      msg: "logged out",
    });
  } catch (err) {
    res.status(500).json({ success: false, err: err.message });
  }
};

export const curUser = async (req, res) => {
  try {
    const token = req.cookies?.jwt;
    if (!token)
      return res.status(401).json({ success: false, msg: "no token found" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usr = await User.findByPk(decoded.userID);

    if (!usr)
      return res.status(404).json({ success: false, err: "no user found" });

    const emp = await Employee.findOne({ where: { email: usr.email } });
    const empInfo = emp
      ? {
          id: emp.id,
          name: emp.name,
          email: emp.email,
          position: emp.position,
          department: emp.department,
          salary: emp.salary,
        }
      : null;

    return res.status(200).json({
      success: true,
      user: userRes(usr),
      employeeInfo: empInfo,
    });
  } catch (err) {
    return res.status(401).json({ success: false, err: "bad token" });
  }
};
