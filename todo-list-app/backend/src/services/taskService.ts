import { Task } from '../models/Task';

export class TaskService {
  async getAllTasks(userId: string): Promise<Task[]> {
    // TODO: 实现数据库查询
    return [];
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    // TODO: 实现数据库创建
    throw new Error('Not implemented');
  }

  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    // TODO: 实现数据库更新
    throw new Error('Not implemented');
  }

  async deleteTask(id: string): Promise<void> {
    // TODO: 实现数据库删除
    throw new Error('Not implemented');
  }
} 