import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Default JWT configuration for demo/development
const DEFAULT_JWT_SECRET = 'ewallet_jwt_secret_key_2024_change_in_production';

const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

/**
 * Compare password with hashed password
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcryptjs.compare(password, hashedPassword);
}

/**
 * Generate JWT token
 */
export function generateToken(userId: string, email: string): string {
  // Use any-cast to avoid TypeScript overload issues with jsonwebtoken types
  return (jwt.sign as any)({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
}

/**
 * Generate a short-lived pre-auth token used during 2FA flows.
 * This token has limited scope (preAuth) and short expiry (e.g., 10 minutes).
 * It is safe to return to the client for UX purposes without granting full access.
 */
export function generatePreAuthToken(userId: string, email: string): string {
  return (jwt.sign as any)({ userId, email, preAuth: true }, JWT_SECRET, { expiresIn: '10m' });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId: string): string {
  return (jwt.sign as any)({ userId }, JWT_SECRET, { expiresIn: '30d' });
}
