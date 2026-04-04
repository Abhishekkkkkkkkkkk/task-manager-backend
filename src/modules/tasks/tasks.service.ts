import { prisma } from '../../lib/prisma';
import { CreateTaskInput, UpdateTaskInput, TaskQuery } from './tasks.schema';
import { TaskStatus } from '@prisma/client';

export class TasksService {
  async getTasks(userId: string, query: TaskQuery) {
    const { page, limit, status, search } = query;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(status && { status: status as TaskStatus }),
      ...(search && {
        title: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async getTaskById(id: string, userId: string) {
    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw new Error('Task not found');
    return task;
  }

  async createTask(userId: string, input: CreateTaskInput) {
    return prisma.task.create({
      data: {
        ...input,
        userId,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      },
    });
  }

  async updateTask(id: string, userId: string, input: UpdateTaskInput) {
    await this.getTaskById(id, userId); // ensures ownership
    return prisma.task.update({
      where: { id },
      data: {
        ...input,
        ...(input.dueDate !== undefined && {
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        }),
      },
    });
  }

  async deleteTask(id: string, userId: string) {
    await this.getTaskById(id, userId); // ensures ownership
    return prisma.task.delete({ where: { id } });
  }

  async toggleTask(id: string, userId: string) {
    const task = await this.getTaskById(id, userId);
    const nextStatus: TaskStatus =
      task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    return prisma.task.update({
      where: { id },
      data: { status: nextStatus },
    });
  }
}