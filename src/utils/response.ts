import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  data: unknown,
  statusCode: number = 200,
  meta?: object
): void => {
  res.status(statusCode).json({
    success: true,
    data,
    ...(meta && { meta }),
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400
): void => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};