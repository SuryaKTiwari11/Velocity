import { genToken } from "../helper/genToken.js";
import { Invite, User } from "../model/model.js";
import jwt from "jsonwebtoken";
import { addInvite } from "../queues/email.js";
import { configDotenv } from "dotenv";
import bcrypt from "bcryptjs";
import redisClient from "../configuration/redis.js";
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

    // Check if user already exists in this company
    if (await User.findOne({ where: { email, companyId } }))
      return res.status(400).json({
        success: false,
        message: "User with this email already exists in this company",
      });

    // Check Redis for existing active invite (faster than DB)
    const redisInviteKey = `invite:${email}:${companyId}`;
    const existingInvite = await redisClient.get(redisInviteKey);

    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: "An active invite already exists for this email.",
      });
    }

    // Generate invite token and create invite data
    const inviteToken = genToken(null, companyCode, companyId);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const inviteData = {
      email,
      companyId,
      companyCode,
      inviteToken,
      expiresAt: expiresAt.toISOString(),
      isUsed: false,
      createdAt: new Date().toISOString(),
    };
    //what is the difference btw company code and company id
    // Company ID is a unique identifier for the company in the database,
    // while Company Code is a more user-friendly, often human-readable
    // representation of the company, which may be used in URLs or emails.

    // Store invite in Redis with 24-hour expiration (temporary storage)
    await redisClient.setEx(
      redisInviteKey,
      24 * 60 * 60,
      JSON.stringify(inviteData)
    );

    // Also store by token for easy lookup during validation
    const tokenKey = `invite:token:${inviteToken}`;
    await redisClient.setEx(tokenKey, 24 * 60 * 60, JSON.stringify(inviteData));

    // Queue invite email for sending (asynchronous)
    const emailResult = await addInvite(email, inviteToken, companyId);

    res.status(201).json({
      success: true,
      message:
        "Invite created successfully and stored in Redis, email queued for sending",
      data: {
        email: inviteData.email,
        companyId: inviteData.companyId,
        expiresAt: inviteData.expiresAt,
        inviteToken: inviteData.inviteToken,
      },
      emailJobId: emailResult.success ? emailResult.jobId : null,
    });
  } catch (error) {
    console.error("Create invite error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}; // Validate invite token from Redis (faster than DB lookup)
export const validateInviteToken = async (req, res) => {
  try {
    const { inviteToken } = req.query;

    if (!inviteToken) {
      return res
        .status(400)
        .json({ success: false, message: "Invite token is required" });
    }

    // Verify JWT token first
    let decoded;
    try {
      decoded = jwt.verify(inviteToken, key);
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired invite token" });
    }

    // Look up invite in Redis using token
    const tokenKey = `invite:token:${inviteToken.trim()}`;
    const inviteDataStr = await redisClient.get(tokenKey);

    if (!inviteDataStr) {
      return res.status(404).json({
        success: false,
        message: "Invite not found or has expired",
      });
    }

    const inviteData = JSON.parse(inviteDataStr);

    // Check if invite is already used
    if (inviteData.isUsed) {
      return res.status(400).json({
        success: false,
        message: "Invite has already been used",
      });
    }

    // Check if invite has expired (extra safety check)
    //but if it has been expired it would have been deleted from redis

    res.status(200).json({
      success: true,
      message: "Invite is valid",
      invite: {
        email: inviteData.email,
        companyId: inviteData.companyId,
        expiresAt: inviteData.expiresAt,
      },
    });
  } catch (error) {
    console.error("Validate invite error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Invite-only signup endpoint using Redis
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

    // Look up invite in Redis
    const tokenKey = `invite:token:${inviteToken}`;
    const inviteDataStr = await redisClient.get(tokenKey);

    if (!inviteDataStr) {
      return res.status(404).json({
        success: false,
        message: "Invite not found or has expired",
      });
    }

    const inviteData = JSON.parse(inviteDataStr);

    // Validate invite data
    if (inviteData.email !== email) {
      return res.status(400).json({
        success: false,
        message: "Email does not match the invited email",
      });
    }

    if (inviteData.isUsed) {
      return res.status(400).json({
        success: false,
        message: "Invite has already been used",
      });
    }

    // Check if invite is expired
    if (new Date(inviteData.expiresAt) < new Date()) {
      // Clean up expired invite
      await redisClient.del(tokenKey);
      await redisClient.del(`invite:${email}:${inviteData.companyId}`);

      return res.status(410).json({
        success: false,
        message: "Invite has expired",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email, companyId: inviteData.companyId },
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
      companyId: inviteData.companyId,
      city: city || "delhi",
      status: "active",
      isVerified: true, // Mark as verified since this is invite-only
    });

    // Mark invite as used in Redis
    inviteData.isUsed = true;
    inviteData.usedAt = new Date().toISOString();

    // Update both Redis keys
    await redisClient.setEx(tokenKey, 24 * 60 * 60, JSON.stringify(inviteData));
    await redisClient.setEx(
      `invite:${email}:${inviteData.companyId}`,
      24 * 60 * 60,
      JSON.stringify(inviteData)
    );

    // Optionally save to database for permanent record (good practice)
    await Invite.create({
      email: inviteData.email,
      companyId: inviteData.companyId,
      inviteToken: inviteData.inviteToken,
      expiresAt: new Date(inviteData.expiresAt),
      isUsed: true,
      usedAt: new Date(),
    });

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
    console.error("Invite signup error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
