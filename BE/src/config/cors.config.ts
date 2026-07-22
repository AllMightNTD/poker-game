export const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://poker-game-lake.vercel.app',
    ];

export const corsOriginFn = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
) => {
  if (!origin) {
    return callback(null, true);
  }

  const isAllowedExplicitly = allowedOrigins.includes(origin);
  const isVercelDomain =
    origin.endsWith('.vercel.app') ||
    origin === 'https://poker-game-lake.vercel.app';
  const isDevMode = process.env.NODE_ENV !== 'production';

  if (isAllowedExplicitly || isVercelDomain || isDevMode) {
    callback(null, true);
  } else {
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  }
};
