import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';

import authRoutes from './modules/auth/auth.routes';
import taskRoutes from './modules/tasks/tasks.routes';
import { sendError } from './utils/response';

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV });
});

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// 404 handler
app.use((_req, res) => {
  sendError(res, 'Route not found', 404);
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err.message);
  sendError(
    res,
    env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    500
  );
});

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

export default app;