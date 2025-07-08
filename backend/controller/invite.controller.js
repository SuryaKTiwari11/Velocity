import { genInviteToken } from "../helper/genToken.js";
import { Invite } from "../model/model.js";
import { User } from "../model/model.js";
import jwt from "jsonwebtoken";
import { addInvite } from "../queues/email.js";
import { configDotenv } from "dotenv";
configDotenv();
const key = process.env.JWT_SECRET;
export const createInvite = async (req, res) => {
  try {
    const { email } = req.body;
    const { companyId, companyCode } = req.user;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user already exists in this company
    const existingUser = await User.findOne({ where: { email, companyId } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists in this company",
      });
    }

    // Check for existing valid invite
    const existingInvite = await Invite.findOne({
      where: {
        email,
        companyId,
        isUsed: false,
        expiresAt: { $gt: new Date() },
      },
    });
    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: "An active invite already exists for this email.",
      });
    }

    // Generate invite token
    const inviteToken = genInviteToken(null, companyCode, companyId);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const invite = await Invite.create({
      companyId,
      email,
      inviteToken,
      expiresAt,
      isUsed: false,
    });

    // Queue to send the email (BullMQ or similar)
    await addInvite(email, inviteToken, companyId);

    res.status(201).json({
      success: true,
      data: invite,
      message: "Invite created successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Validate invite token only (GET /api/invite/validate?inviteToken=...)
export const validateInviteToken = async (req, res) => {
  try {
    const { inviteToken } = req.query;
    if (!inviteToken) {
      return res
        .status(400)
        .json({ success: false, message: "Invite token is required" });
    }
 
    let decoded;
    try {
      decoded = jwt.verify(inviteToken, key);
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired invite token" });
    }
    // Find invite in DB
    const invite = await Invite.findOne({
      where: { inviteToken, isUsed: false },
    });
    if (!invite) {
      return res
        .status(404)
        .json({ success: false, message: "Invite not found or already used" });
    }
    if (invite.expiresAt < new Date()) {
      return res
        .status(410)
        .json({ success: false, message: "Invite has expired" });
    }
    res.status(200).json({
      success: true,
      message: "Invite is valid",
      invite: {
        email: invite.email,
        companyId: invite.companyId,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Invite-only signup endpoint
export const validateInviteAndSignup = async (req, res) => {
  try {
    const { inviteToken, email, password, name } = req.body;

    // Validate input
    if (!inviteToken || !email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "All fields (inviteToken, email, password, name) are required",
      });
    }

    // Find invite
    const invite = await Invite.findOne({
      where: { inviteToken, email, isUsed: false },
    });
    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invite not found or already used",
      });
    }

    // Check if invite is expired
    if (invite.expiresAt < new Date()) {
      return res.status(410).json({
        success: false,
        message: "Invite has expired",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email, companyId: invite.companyId },
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists in this company",
      });
    }

    // Create user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      companyId: invite.companyId,
      status: "active",
    });

    // Mark invite as used
    invite.isUsed = true;
    await invite.save();

    res.status(201).json({
      success: true,
      message: "Signup successful via invite",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyId: user.companyId,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
