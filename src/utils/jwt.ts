import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';

// Shape of data we store inside the token
export interface TokenPayload {
  userId: string;
  email: string;
}

// What comes back when we verify a token
export interface VerifiedToken extends JwtPayload, TokenPayload {}

// Generate tokens

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

// Verify tokens

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