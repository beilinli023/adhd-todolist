import { ITask } from '../models/Task';
import TaskModel from '../models/Task';
import { CreateTaskDTO, UpdateTaskDTO, TaskQueryParams } from '../types/task';
import { Types } from 'mongoose';

export class TaskService {
  async getAllTasks(userId: string, params?: TaskQueryParams): Promise<{ tasks: ITask[]; total: number }> {
    try {
      const query: any = { user: new Types.ObjectId(userId) };

      // 添加过滤条件
      if (params?.status) {
        query.status = params.status;
      }
      if (params?.priority) {
        query.priority = params.priority;
      }
      if (params?.category) {
        query.category = params.category;
      }
      if (params?.tags) {
        query.tags = { $in: Array.isArray(params.tags) ? params.tags : [params.tags] };
      }
      if (params?.search) {
        query.$or = [
          { title: { $regex: params.search, $options: 'i' } },
          { description: { $regex: params.search, $options: 'i' } }
        ];
      }
      if (params?.startDate || params?.endDate) {
        query.dueDate = {};
        if (params.startDate) {
          query.dueDate.$gte = new Date(params.startDate);
        }
        if (params.endDate) {
          query.dueDate.$lte = new Date(params.endDate);
        }
      }

      // 计算分页
      const page = params?.page || 1;
      const limit = Math.min(params?.limit || 20, 50);
      const skip = (page - 1) * limit;

      // 构建排序
      let sort: any = { createdAt: -1 }; // 默认按创建时间降序
      if (params?.sortBy) {
        sort = {
          [params.sortBy]: params.sortOrder === 'asc' ? 1 : -1
        };
      }

      // 执行查询
      const [tasks, total] = await Promise.all([
        TaskModel.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .exec(),
        TaskModel.countDocuments(query)
      ]);

      return { tasks, total };
    } catch (error) {
      console.error('获取任务列表失败:', error);
      throw error;
    }
  }

  async createTask(userId: string, taskData: CreateTaskDTO): Promise<ITask> {
    try {
      const task = new TaskModel({
        ...taskData,
        user: new Types.ObjectId(userId),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await task.save();
      return task;
    } catch (error) {
      console.error('创建任务失败:', error);
      throw error;
    }
  }

  async updateTask(userId: string, taskId: string, updates: UpdateTaskDTO): Promise<ITask | null> {
    try {
      const task = await TaskModel.findOneAndUpdate(
        { _id: new Types.ObjectId(taskId), user: new Types.ObjectId(userId) },
        { ...updates, updatedAt: new Date() },
        { new: true }
      );

      if (!task) {
        throw new Error('任务不存在或无权访问');
      }

      return task;
    } catch (error) {
      console.error('更新任务失败:', error);
      throw error;
    }
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    try {
      const result = await TaskModel.deleteOne({
        _id: new Types.ObjectId(taskId),
        user: new Types.ObjectId(userId)
      });

      if (result.deletedCount === 0) {
        throw new Error('任务不存在或无权删除');
      }
    } catch (error) {
      console.error('删除任务失败:', error);
      throw error;
    }
  }

  async batchUpdateStatus(
    userId: string,
    taskIds: string[],
    status: 'pending' | 'in_progress' | 'completed' | 'archived'
  ): Promise<number> {
    try {
      const result = await TaskModel.updateMany(
        {
          _id: { $in: taskIds.map(id => new Types.ObjectId(id)) },
          user: new Types.ObjectId(userId)
        },
        {
          $set: { status, updatedAt: new Date() }
        }
      );

      return result.modifiedCount;
    } catch (error) {
      console.error('批量更新任务状态失败:', error);
      throw error;
    }
  }

  async batchDelete(userId: string, taskIds: string[]): Promise<number> {
    try {
      const result = await TaskModel.deleteMany({
        _id: { $in: taskIds.map(id => new Types.ObjectId(id)) },
        user: new Types.ObjectId(userId)
      });

      return result.deletedCount;
    } catch (error) {
      console.error('批量删除任务失败:', error);
      throw error;
    }
  }
} 