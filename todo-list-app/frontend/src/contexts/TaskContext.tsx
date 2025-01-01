import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Task, TaskStatus, TaskQueryParams, UpdateTaskDTO } from '../types/task';
import * as taskService from '../services/task';

interface TaskContextType {
  tasks: Task[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  setTasks: (tasks: Task[]) => void;
  fetchTasks: (params?: TaskQueryParams) => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, updates: UpdateTaskDTO) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  batchUpdateStatus: (taskIds: string[], status: TaskStatus) => Promise<void>;
  batchDelete: (taskIds: string[]) => Promise<void>;
  updateTaskOrder: (taskId: string, newOrder: number) => Promise<void>;
  updateTasksOrder: (tasks: { _id: string; order: number }[]) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (params?: TaskQueryParams) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await taskService.getTasks(params);
      if (response.success) {
        setTasks(response.data.tasks);
        setTotal(response.data.total);
        setPage(response.data.page);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.error || '获取任务列表失败');
      }
    } catch (err: any) {
      setError(err.error || '获取任务列表失败');
      console.error('获取任务列表失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTask = useCallback(async (task: Partial<Task>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await taskService.createTask(task);
      if (response.success) {
        await fetchTasks();
      } else {
        setError(response.error || '创建任务失败');
        throw new Error(response.error || '创建任务失败');
      }
    } catch (err: any) {
      setError(err.error || '创建任务失败');
      console.error('创建任务失败:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTasks]);

  const updateTask = useCallback(async (id: string, updates: UpdateTaskDTO) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await taskService.updateTask(id, updates);
      if (response.success) {
        await fetchTasks();
      } else {
        setError(response.error || '更新任务失败');
        throw new Error(response.error || '更新任务失败');
      }
    } catch (err: any) {
      setError(err.error || '更新任务失败');
      console.error('更新任务失败:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTasks]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await taskService.deleteTask(id);
      if (response.success) {
        await fetchTasks();
      } else {
        setError(response.error || '删除任务失败');
        throw new Error(response.error || '删除任务失败');
      }
    } catch (err: any) {
      setError(err.error || '删除任务失败');
      console.error('删除任务失败:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTasks]);

  const batchUpdateStatus = useCallback(async (taskIds: string[], status: TaskStatus) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await taskService.batchOperation(taskIds, 'update_status', { status });
      if (response.success) {
        await fetchTasks();
      } else {
        setError(response.error || '批量更新状态失败');
        throw new Error(response.error || '批量更新状态失败');
      }
    } catch (err: any) {
      setError(err.error || '批量更新状态失败');
      console.error('批量更新状态失败:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTasks]);

  const batchDelete = useCallback(async (taskIds: string[]) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await taskService.batchOperation(taskIds, 'delete');
      if (response.success) {
        await fetchTasks();
      } else {
        setError(response.error || '批量删除失败');
        throw new Error(response.error || '批量删除失败');
      }
    } catch (err: any) {
      setError(err.error || '批量删除失败');
      console.error('批量删除失败:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTasks]);

  const updateTaskOrder = useCallback(async (taskId: string, newOrder: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await taskService.updateTaskOrder(taskId, newOrder);
      if (response.success) {
        await fetchTasks();
      } else {
        setError(response.error || '更新任务顺序失败');
        throw new Error(response.error || '更新任务顺序失败');
      }
    } catch (err: any) {
      setError(err.error || '更新任务顺序失败');
      console.error('更新任务顺序失败:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTasks]);

  const updateTasksOrder = useCallback(async (tasks: { _id: string; order: number }[]) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await taskService.updateTasksOrder(tasks);
      if (response.success) {
        await fetchTasks();
      } else {
        setError(response.error || '批量更新任务顺序失败');
        throw new Error(response.error || '批量更新任务顺序失败');
      }
    } catch (err: any) {
      setError(err.error || '批量更新任务顺序失败');
      console.error('批量更新任务顺序失败:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTasks]);

  const value = {
    tasks,
    total,
    page,
    totalPages,
    isLoading,
    error,
    setError,
    setTasks,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    batchUpdateStatus,
    batchDelete,
    updateTaskOrder,
    updateTasksOrder,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}; 