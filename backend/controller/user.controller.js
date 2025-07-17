
import { configDotenv } from "dotenv";
import { User } from "../model/model.js";
import { Op } from "sequelize";

configDotenv();

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