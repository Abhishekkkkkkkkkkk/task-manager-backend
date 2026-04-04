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



// import { Response } from 'express';

// export const sendSuccess = (res: Response, data: unknown, statusCode = 200, meta?: object) => {
//   res.status(statusCode).json({ success: true, data, ...(meta && { meta }) });
// };

// export const sendError = (res: Response, message: string, statusCode = 400) => {
//   res.status(statusCode).json({ success: false, message });
// };