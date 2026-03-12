import rateLimit from 'express-rate-limit';

/** Global limiter: 100 req / 1 min per IP */
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many requests', retryAfter: 60 },
});

/** Auth limiter: 10 req / 1 min — brute-force protection */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many login attempts', retryAfter: 60 },
});
