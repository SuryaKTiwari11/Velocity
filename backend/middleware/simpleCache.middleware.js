import { getCache, setCache } from "../utils/redisCache.js";

export const simpleCache = (ttlSeconds = 30) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Create cache key from URL and user ID
    const userId = req.user?.id || "anonymous";
    const cacheKey = `cache:${userId}:${req.originalUrl}`;

    try {
      // Try to get from Redis using utility function
      const cached = await getCache(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // Store original res.json method
      const originalJson = res.json;

      // Override res.json to cache the response in Redis
      res.json = function (body) {
        // Only cache successful responses
        if (res.statusCode === 200) {
          setCache(cacheKey, body, ttlSeconds); // Save to Redis
        }

        // Call original json method
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.log("Redis cache middleware error:", error);
      next(); // Continue without cache on Redis error
    }
  };
};
