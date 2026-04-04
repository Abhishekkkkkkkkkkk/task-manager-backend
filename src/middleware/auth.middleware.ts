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









// import { Request, Response, NextFunction } from 'express';
// import { verifyAccessToken, TokenPayload } from '../utils/jwt';
// import { sendError } from '../utils/response';

// // Extend Express Request type
// declare global {
//   namespace Express {
//     interface Request {
//       user?: TokenPayload;
//     }
//   }
// }

// export const authenticate = (req: Request, res: Response, next: NextFunction) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return sendError(res, 'No token provided', 401);
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     const payload = verifyAccessToken(token);
//     req.user = payload;
//     next();
//   } catch {
//     return sendError(res, 'Invalid or expired token', 401);
//   }
// };