/**
 * CORS Configuration
 * Cross-Origin Resource Sharing settings for API security
 */

export const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? ['https://your-production-domain.com']
      : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

/**
 * CORS whitelist domains
 */
export const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin) {
  if (!origin) return true; // Allow requests with no origin (mobile apps, etc.)
  return allowedOrigins.includes(origin);
}
