import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';

// Extend the Express Request type so req.user is available everywhere
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  // Check header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'No token provided. Please log in.',
    });
    return;
  }

  // Extract the token part after "Bearer "
  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Malformed authorization header.',
    });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    // Attach user info to req so controllers can access it
    req.user = {
      userId: payload.userId,
      email: payload.email,
    };
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Token is invalid or has expired. Please log in again.',
    });
  }
};