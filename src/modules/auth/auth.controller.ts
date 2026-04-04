import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 201);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Registration failed';
    sendError(res, msg, 409);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Login failed';
    sendError(res, msg, 401);
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const tokens = await authService.refresh(req.body.refreshToken);
    sendSuccess(res, tokens);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Token refresh failed';
    sendError(res, msg, 401);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    await authService.logout(req.body.refreshToken);
    sendSuccess(res, { message: 'Logged out successfully' });
  } catch {
    sendSuccess(res, { message: 'Logged out' });
  }
};