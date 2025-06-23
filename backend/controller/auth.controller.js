import { User, Employee } from "../model/model.js";
import bcrypt from "bcryptjs";
import { genToken } from "../helper/genToken.js";
import jwt from "jsonwebtoken";
import { sendOTP, cleanupOldOTPs } from "../helper/otpService.js";

const userRes = (usr) => ({
  id: usr.id,
  name: usr.name,
  email: usr.email,
  isAdmin: usr.isAdmin,
  isVerified: usr.isVerified,
  profilePicture: usr.profilePicture,
  createdAt: usr.createdAt,
});

export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

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
    });

    Employee.create({
      name,
      email,
      position: "not assigned yet",
      department: "not assigned yet",
      salary: 0,
    }).catch((err) => {
      console.error("Emp record err:", err);
    });

    const token = genToken(user.id, res);

    sendOTP(email).catch((err) => {
      console.error("OTP err:", err);
    });

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
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, err: "need email and pass" });
    }

    const usr = await User.findOne({ where: { email } });
    if (!usr)
      return res.status(404).json({ success: false, err: "no user found" });

    const match = await bcrypt.compare(password, usr.password);
    if (!match)
      return res.status(401).json({ success: false, err: "wrong password" });

    if (!usr.isVerified && !usr.googleId && !usr.githubId) {
      return res.status(403).json({
        success: false,
        err: "plz verify ur email first",
        needsVerification: true,
        email: usr.email,
      });
    }

    const token = genToken(usr.id, res);

    res.status(200).json({
      success: true,
      msg: "login ok",
      user: userRes(usr),
      token,
    });
  } catch (err) {
    res.status(500).json({ success: false, err: err.message });
  }
};

export const logout = async (req, res) => {
  try {
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
    let token =
      req.cookies?.jwt ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization);

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
    console.error("curUser err:", err);
    return res.status(401).json({ success: false, err: "bad token" });
  }
};
