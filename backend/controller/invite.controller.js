import { genToken } from "../helper/genToken.js";
import { Invite, User } from "../model/model.js";
import jwt from "jsonwebtoken";
import { addInvite } from "../queues/email.js";
import { configDotenv } from "dotenv";
import bcrypt from "bcryptjs";
configDotenv();
const key = process.env.JWT_SECRET;
export const createInvite = async (req, res) => {
  try {
    const { email } = req.body;
    const { companyId, companyCode } = req.user;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    if (await User.findOne({ where: { email, companyId } }))
      return res.status(400).json({
        success: false,
        message: "User with this email already exists in this company",
      });
    if (
      await Invite.findOne({
        where: {
          email,
          companyId,
          isUsed: false,
          expiresAt: { $gt: new Date() },
        },
      })
    )
      return res.status(400).json({
        success: false,
        message: "An active invite already exists for this email.",
      });
    const inviteToken = genToken(null, companyCode, companyId);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const invite = await Invite.create({
      companyId,
      email,
      inviteToken,
      expiresAt,
      isUsed: false,
    });
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

    // Debug logging for incoming token
    // [Invite Validate] Incoming token

    let decoded;
    try {
      decoded = jwt.verify(inviteToken, key);
    } catch (err) {
      // [Invite Validate] JWT verification failed
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired invite token" });
    }

    // Strip whitespace from token for DB lookup
    const trimmedToken = inviteToken.trim();

    // Find invite by token only (ignore isUsed for debug)
    const inviteRaw = await Invite.findOne({
      where: { inviteToken: trimmedToken },
    });
    if (inviteRaw) {
      // [Invite Validate] Found invite by token
      // Uncomment for debugging:
      // console.log({
      //   inviteToken: inviteRaw.inviteToken,
      //   isUsed: inviteRaw.isUsed,
      //   expiresAt: inviteRaw.expiresAt,
      //   type_isUsed: typeof inviteRaw.isUsed,
      // });
    } else {
      // [Invite Validate] No invite found by token at all
    }

    // Now do the real query (with isUsed)
    const invite = await Invite.findOne({
      where: { inviteToken: trimmedToken, isUsed: false },
    });
    // Log all DB tokens for debugging (remove in production)
    const allInvites = await Invite.findAll({
      attributes: ["inviteToken", "isUsed", "expiresAt"],
    });
    // Uncomment for debugging:
    // console.log(
    //   "[Invite Validate] All DB tokens:",
    //   allInvites.map((i) => i.inviteToken)
    // );

    if (!invite) {
      // Uncomment for debugging:
      // console.log(
      //   "[Invite Validate] No invite found for token with isUsed=false:",
      //   trimmedToken
      // );
      return res.status(404).json({
        success: false,
        message: "Invite not found or already used (token mismatch or isUsed).",
      });
    }
    if (invite.expiresAt < new Date()) {
      // [Invite Validate] Invite expired for token
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
    const { inviteToken, email, password, name, city } = req.body;

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
      city: city || "delhi",
      status: "active",
      isVerified: true, // Mark as verified since this is invite-only
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
