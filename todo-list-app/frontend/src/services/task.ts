import { api } from './api';
import type { Task, TaskStatus, TaskQueryParams } from '../types/task';

const API_URL = '/api/tasks';

export const getTasks = async (params?: TaskQueryParams) => {
  const response = await api.get(API_URL, { params });
  return response.data;
};

export const getTask = async (id: string) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

export const createTask = async (task: Partial<Task>) => {
  const response = await api.post(API_URL, task);
  return response.data;
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
  const response = await api.put(`${API_URL}/${id}`, updates);
  return response.data;
};

export const deleteTask = async (id: string) => {
  const response = await api.delete(`${API_URL}/${id}`);
  return response.data;
};

export const batchOperation = async (
  taskIds: string[],
  action: 'update_status' | 'delete',
  data?: { status?: TaskStatus }
) => {
  const response = await api.post(`${API_URL}/batch`, {
    taskIds,
    action,
    data
  });
  return response.data;
};

export const updateTaskOrder = async (taskId: string, newOrder: number) => {
  const response = await api.patch(`${API_URL}/${taskId}/order`, { newOrder });
  return response.data;
};

export const updateTasksOrder = async (tasks: { _id: string; order: number }[]) => {
  const response = await api.patch(`${API_URL}/batch/order`, { tasks });
  return response.data;
}; 