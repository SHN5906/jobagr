import dotenv from 'dotenv';

dotenv.config();

function require_env(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  nodeEnv:      process.env['NODE_ENV'] ?? 'development',
  port:         parseInt(process.env['PORT'] ?? '3000', 10),
  jwtSecret:    require_env('JWT_SECRET'),
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] ?? '15m',
  bcryptRounds: parseInt(process.env['BCRYPT_ROUNDS'] ?? '12', 10),
  corsOrigins:  (process.env['CORS_ORIGINS'] ?? 'http://localhost:5173').split(',').map(o => o.trim()),
} as const;
