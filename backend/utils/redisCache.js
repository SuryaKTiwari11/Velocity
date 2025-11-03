import redisClient from "../configuration/redis.js";

// Redis cache utility functions
export const setCache = async (key, data, ttlSeconds = 30) => {
  try {
    await redisClient.setex(key, ttlSeconds, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Redis SET error:", error);
    return false;
  }
};

export const getCache = async (key) => {
  try {
    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.error("Redis GET error:", error);
    return null;
  }
};

export const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error("Redis DELETE error:", error);
    return false;
  }
};

// Clear all cache entries for a specific user
export const clearUserCache = async (userId) => {
  try {
    const pattern = `cache:${userId}:*`;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
    return true;
  } catch (error) {
    console.error("Redis clear user cache error:", error);
    return false;
  }
};
