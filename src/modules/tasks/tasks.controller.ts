import { Request, Response } from 'express';
import { TasksService } from './tasks.service';
import { sendSuccess, sendError } from '../../utils/response';
import { taskQuerySchema } from './tasks.schema';

const tasksService = new TasksService();

// GET /tasks 
export const getTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const queryResult = taskQuerySchema.safeParse(req.query);

    if (!queryResult.success) {
      sendError(res, 'Invalid query parameters', 400);
      return;
    }

    const { tasks, meta } = await tasksService.getTasks(
      req.user!.userId,
      queryResult.data
    );

    sendSuccess(res, tasks, 200, meta);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tasks';
    sendError(res, message, 500);
  }
};

// GET /tasks/:id
export const getTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Fix: extract id as string - req.params values are always strings
    const id = req.params.id as string;

    const task = await tasksService.getTaskById(id, req.user!.userId);
    sendSuccess(res, task);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Task not found';
    sendError(res, message, 404);
  }
};

// POST /tasks
export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // req.body is already validated by validate(createTaskSchema) in the route
    const task = await tasksService.createTask(req.user!.userId, req.body);
    sendSuccess(res, task, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create task';
    sendError(res, message, 500);
  }
};

// PATCH /tasks/:id
export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Fix: extract id as string
    const id = req.params.id as string;

    const task = await tasksService.updateTask(id, req.user!.userId, req.body);
    sendSuccess(res, task);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update task';
    const statusCode = message.toLowerCase().includes('not found') ? 404 : 500;
    sendError(res, message, statusCode);
  }
};

// DELETE /tasks/:id
export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Fix: extract id as string
    const id = req.params.id as string;

    await tasksService.deleteTask(id, req.user!.userId);
    sendSuccess(res, { message: 'Task deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete task';
    const statusCode = message.toLowerCase().includes('not found') ? 404 : 500;
    sendError(res, message, statusCode);
  }
};

// PATCH /tasks/:id/toggle
export const toggleTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Fix: extract id as string
    const id = req.params.id as string;

    const task = await tasksService.toggleTask(id, req.user!.userId);
    sendSuccess(res, task);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to toggle task';
    const statusCode = message.toLowerCase().includes('not found') ? 404 : 500;
    sendError(res, message, statusCode);
  }
};