import { AccessToken } from "livekit-server-sdk";
import { configDotenv } from "dotenv";
import { User } from "../model/model.js";
import { Op } from "sequelize";

configDotenv();

// POST /api/users/livekit-token
export const getLivekitToken = async (req, res) => {
  try {
    const { room, name } = req.body;
    if (!room || !name) {
      return res.status(400).json({ error: "room and name are required" });
    }
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: name,
        ttl: "10m",
      }
    );
    at.addGrant({ roomJoin: true, room });
    const token = await at.toJwt();
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Could not generate token" });
  }
};

// GET /api/users/search?q=searchTerm
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user.id;

    if (!q || q.trim().length < 2) {
      return res.json({ users: [] });
    }

    const searchTerm = q.trim();
    const companyId = req.user.companyId;
    const users = await User.findAll({
      attributes: ["id", "name", "email", "companyId"],
      where: {
        companyId,
        id: { [Op.ne]: currentUserId }, //! Exclude current user
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { email: { [Op.iLike]: `%${searchTerm}%` } },
        ],
      },
      limit: 10,   });

    res.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Could not search users" });
  }
};
