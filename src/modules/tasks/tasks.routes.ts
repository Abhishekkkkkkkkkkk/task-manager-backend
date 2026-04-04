import { Router } from 'express';
import { getTasks, getTask, createTask, updateTask, deleteTask, toggleTask } from './tasks.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createTaskSchema, updateTaskSchema } from './tasks.schema';

const router = Router();

router.use(authenticate); // All task routes require auth

router.get('/', getTasks);
router.post('/', validate(createTaskSchema), createTask);
router.get('/:id', getTask);
router.patch('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/toggle', toggleTask);

export default router;