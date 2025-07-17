import { configDotenv } from "dotenv";
import Redis from "ioredis";
configDotenv();
const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || "",
  maxRetriesPerRequest: null,
  retryDelayOnFailover: 100,
  lazyConnect: true,
};
const redisClient = new Redis(redisConfig);
export const createRedisConnection = () => {
  return new Redis(redisConfig);
};

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redisClient.on("connect", () => {
  // Connected to Redis server
});

export default redisClient;

//! The `createRedisConnection` function allows you to create a new Redis connection whenever you need it, while the `redisClient` variable holds a single connection that can be used throughout your application.
//! This is useful because sometimes you might want to create a new connection for specific tasks, like handling a large batch of jobs in a worker process.
//! By exporting both the `redisClient` and the `createRedisConnection` function, you can use the same connection in most parts of your application,
//! but also create new connections when needed without affecting the main connection.
