import {
  generateStreamToken,
  upsertStreamUser,
} from "../configuration/stream.js";
import { User } from "../model/model.js";

export const getStreamToken = async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const companyId = req.user.companyId;
    const userData = {
      name: req.user.name || req.user.email,
    };

    await upsertStreamUser(userId, userData, companyId);


    const token = generateStreamToken(userId);
    if (!token) {
      return res
        .status(400)
        .json({ message: "Failed to generate Stream token" });
    }

    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const upsertTargetUser = async (req, res) => {
  try {
    const { targetUserId } = req.params;

      const companyId = req.user.companyId;
    const targetUser = await User.findOne({
      where: { id: targetUserId, companyId },
    });
    if (!targetUser) {
      return res
        .status(404)
        .json({ message: "Target user not found or not in your company" });
    }

    
    const targetUserData = {
      name: targetUser.name || targetUser.email,
    };

    await upsertStreamUser(targetUserId.toString(), targetUserData);

    return res.status(200).json({
      message: "Target user upserted successfully",
      user: {
        id: targetUser.id,
        name: targetUser.name || targetUser.email,
      },
    });
  } catch (error) {
    console.error("Error upserting target user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
