import redisClient from "../configuration/redis.js";

// Simple idempotency checker for emails
export const checkEmailIdempotency = async (email, type, timeInMinutes = 5) => {
  try {
    const key = `email:${type}:${email}`;
    const exists = await redisClient.exists(key);

    if (exists) {
      return { allowed: false, message: "Email already sent recently" };
    }

    // Set key with expiration
    await redisClient.setex(key, timeInMinutes * 60, "sent");
    return { allowed: true, message: "Email can be sent" };
  } catch (error) {
    console.error("Redis error:", error);
    return { allowed: true, message: "Redis error, allowing email" };
  }
};
