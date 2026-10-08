

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 20;

export function createRateLimiter(
  redis
) {
  return async function rateLimiter(
    req,
    res,
    next
  ) {
    try {
      const ip =
        req.ip ||
        req.socket.remoteAddress ||
        "unknown";

      const key = `rate:${ip}`;
      
      const count = await redis.incr(key);
      console.log("ip ",count);

      if (count === 1) {
        await redis.expire(key, WINDOW_SECONDS);
      }

      if (count > MAX_REQUESTS) {
        return res.status(429).json({
          message: "Too many requests, please try again later.",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}