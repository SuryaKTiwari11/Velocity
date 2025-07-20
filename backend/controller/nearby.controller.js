import redisClient from "../configuration/redis.js";
import { User } from "../model/model.js";
export const findNearby = async (req, res) => {
  const { userId, latitude, longitude, radius = 200 } = req.body;
  const companyId = req.user.companyId;
  try {
    const nearby = await redisClient.georadius(
      "user:locations",
      longitude,
      latitude,
      radius,
      "m",
      "WITHDIST",
      "COUNT",
      11
    );

    const filtered = [];
    for (const [id, dist] of nearby) {
      if (id === userId) {
        continue;
      }
      const userMeta = await redisClient.hgetall(`user:meta:${id}`);
      if (userMeta && String(userMeta.companyId) === String(companyId)) {
        filtered.push({ id, dist });
        if (filtered.length === 10) break;
      } else {
      }
    }

    const ids = filtered.map((u) => u.id);
    const userDetailsList = await User.findAll({
      where: { id: ids, companyId },
      attributes: ["id", "name", "email"],
    });
    const userDetailsMap = {};
    for (const user of userDetailsList) {
      userDetailsMap[user.id] = user;
    }

    const nearbyUsers = filtered
      .map((u) => {
        const user = userDetailsMap[u.id];
        return user
          ? { id: user.id, dist: u.dist, name: user.name, email: user.email }
          : null;
      })
      .filter(Boolean);
    res.json({ people: nearbyUsers });
  } catch (error) {
    res.status(500).json({ error: "error in finding Nearby server error" });
  }
};

export const updateLocation = async (req, res) => {
  const { userId, latitude, longitude } = req.body;
  const companyId = req.user.companyId;
  // Accept only real coordinates (not null/undefined/0)
  if (
    !userId ||
    latitude == null ||
    longitude == null ||
    latitude === 0 ||
    longitude === 0 ||
    !companyId
  ) {
    // Removed debug log
    return res
      .status(400)
      .json({ error: "Missing or invalid required fields" });
  }
  try {
    // Fetch user details from DB for metadata
    const user = await User.findOne({
      where: { id: userId, companyId },
      attributes: ["id", "name", "email"],
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await redisClient.geoadd("user:locations", longitude, latitude, userId);
    await redisClient.hmset(`user:meta:${userId}`, {
      companyId,
      name: user.name,
      email: user.email,
      updatedAt: Date.now(),
    });
    res.json({ success: true });
  } catch (error) {
    // Removed debug log
    res.status(500).json({ error: "updateLocation controller server error" });
  }
};
