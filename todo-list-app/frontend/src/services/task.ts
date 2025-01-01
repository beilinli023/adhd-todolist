import { api } from './api';
import type {
  Task,
  CreateTaskDTO,
  UpdateTaskDTO,
  TaskQueryParams,
  TaskListResponse,
  BatchOperationDTO,
} from '../types/task';

export const taskService = {
  // 创建任务
  async createTask(data: CreateTaskDTO): Promise<Task> {
    try {
      console.log('发送创建任务请求:', data);
      const response = await api.post<{ success: boolean; data: Task; error?: { message: string } }>('/tasks', data);
      console.log('创建任务响应:', response.data);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || '创建任务失败');
      }
      return response.data.data;
    } catch (error) {
      console.error('创建任务失败:', error);
      throw error;
    }
  },

  // 获取任务列表
  async getTasks(params: TaskQueryParams = {}): Promise<TaskListResponse> {
    try {
      console.log('发送获取任务列表请求:', params);
      const response = await api.get<{ success: boolean; data: TaskListResponse; error?: { message: string } }>('/tasks', { params });
      console.log('获取任务列表响应:', response.data);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || '获取任务列表失败');
      }
      return response.data.data;
    } catch (error) {
      console.error('获取任务列表失败:', error);
      throw error;
    }
  },

  // 获取单个任务
  async getTaskById(id: string): Promise<Task> {
    try {
      console.log('发送获取单个任务请求:', id);
      const response = await api.get<{ success: boolean; data: Task; error?: { message: string } }>(`/tasks/${id}`);
      console.log('获取单个任务响应:', response.data);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || '获取任务失败');
      }
      return response.data.data;
    } catch (error) {
      console.error('获取任务失败:', error);
      throw error;
    }
  },

  // 更新任务
  async updateTask(id: string, data: UpdateTaskDTO): Promise<Task> {
    try {
      console.log('发送更新任务请求:', { id, data });
      const response = await api.put<{ success: boolean; data: Task; error?: { message: string } }>(`/tasks/${id}`, data);
      console.log('更新任务响应:', response.data);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || '更新任务失败');
      }
      return response.data.data;
    } catch (error) {
      console.error('更新任务失败:', error);
      throw error;
    }
  },

  // 删除任务
  async deleteTask(id: string): Promise<void> {
    try {
      console.log('发送删除任务请求:', id);
      const response = await api.delete<{ success: boolean; error?: { message: string } }>(`/tasks/${id}`);
      console.log('删除任务响应:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || '删除任务失败');
      }
    } catch (error) {
      console.error('删除任务失败:', error);
      throw error;
    }
  },

  // 批量操作
  async batchOperation(data: BatchOperationDTO): Promise<{ modifiedCount?: number; deletedCount?: number }> {
    try {
      console.log('发送批量操作请求:', data);
      const response = await api.post<{ success: boolean; data: { modifiedCount?: number; deletedCount?: number }; error?: { message: string } }>('/tasks/batch', data);
      console.log('批量操作响应:', response.data);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || '批量操作失败');
      }
      return response.data.data;
    } catch (error) {
      console.error('批量操作失败:', error);
      throw error;
    }
  },
}; 