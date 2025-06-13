import { rateLimit } from "express-rate-limit";

// General API rate limiter
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 100, // Limit each IP to 100 requests per 10 minutes
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // store: ... , // Redis, Memcached, etc. See below.
});

// Specific rate limiter for OTP requests (stricter)
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 OTP requests per 15 minutes
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: "Too many OTP requests. Please try again after 15 minutes.",
});

// Verification has a separate limiter to prevent brute forcing
const otpVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // Limit each IP to 10 verification attempts per hour
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: "Too many verification attempts. Please try again after an hour.",
});

// General rate limiter middleware
export const rateLimiterMiddleware = (req, res, next) => {
  limiter(req, res, (err) => {
    if (err) {
      console.error("Rate limiter error:", err);
      return res.status(429).json({
        success: false,
        message: "Too many requests, please try again later.",
      });
    }
    next();
  });
};

// Export specific limiters for direct use in routes
export const otpRequestLimiter = otpLimiter;
export const otpVerifyLimiter = otpVerificationLimiter;
