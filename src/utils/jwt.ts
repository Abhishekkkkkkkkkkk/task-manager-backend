import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';

// Shape of data we store inside the token
export interface TokenPayload {
  userId: string;
  email: string;
}

// What comes back when we verify a token
export interface VerifiedToken extends JwtPayload, TokenPayload {}

// ─── Generate tokens ───────────────────────────────────────────

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
};

// ─── Verify tokens ─────────────────────────────────────────────

export const verifyAccessToken = (token: string): VerifiedToken => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as VerifiedToken;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): VerifiedToken => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as VerifiedToken;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};













// import jwt from 'jsonwebtoken';

// const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
// const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

// export interface TokenPayload {
//   userId: string;
//   email: string;
// }

// export const generateAccessToken = (payload: TokenPayload): string => {
//   return jwt.sign(payload, ACCESS_SECRET, {
//     expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
//   });
// };

// export const generateRefreshToken = (payload: TokenPayload): string => {
//   return jwt.sign(payload, REFRESH_SECRET, {
//     expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
//   });
// };

// export const verifyAccessToken = (token: string): TokenPayload => {
//   return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
// };

// export const verifyRefreshToken = (token: string): TokenPayload => {
//   return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
// };