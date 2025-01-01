import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Task, CreateTaskDTO, UpdateTaskDTO, TaskQueryParams } from '../types/task';
import { taskService } from '../services/task';

interface TaskContextState {
  tasks: Task[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

interface TaskContextType extends TaskContextState {
  createTask: (data: CreateTaskDTO) => Promise<void>;
  updateTask: (id: string, data: UpdateTaskDTO) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  fetchTasks: (params?: TaskQueryParams) => Promise<void>;
  batchUpdateStatus: (taskIds: string[], status: Task['status']) => Promise<void>;
  batchDelete: (taskIds: string[]) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TaskContextState>({
    tasks: [],
    total: 0,
    page: 1,
    totalPages: 1,
    isLoading: false,
    error: null,
  });

  const fetchTasks = useCallback(async (params: TaskQueryParams = {}) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await taskService.getTasks(params);
      setState(prev => ({
        ...prev,
        tasks: response.tasks,
        total: response.total,
        page: response.page,
        totalPages: response.totalPages,
        isLoading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '获取任务列表失败',
      }));
    }
  }, []);

  const createTask = async (data: CreateTaskDTO) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await taskService.createTask(data);
      await fetchTasks(); // 刷新任务列表
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '创建任务失败',
      }));
      throw error;
    }
  };

  const updateTask = async (id: string, data: UpdateTaskDTO) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await taskService.updateTask(id, data);
      await fetchTasks(); // 刷新任务列表
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '更新任务失败',
      }));
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await taskService.deleteTask(id);
      await fetchTasks(); // 刷新任务列表
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '删除任务失败',
      }));
      throw error;
    }
  };

  const batchUpdateStatus = async (taskIds: string[], status: Task['status']) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await taskService.batchOperation({
        taskIds,
        action: 'update_status',
        data: { status },
      });
      await fetchTasks(); // 刷新任务列表
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '批量更新任务状态失败',
      }));
      throw error;
    }
  };

  const batchDelete = async (taskIds: string[]) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await taskService.batchOperation({
        taskIds,
        action: 'delete',
      });
      await fetchTasks(); // 刷新任务列表
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '批量删除任务失败',
      }));
      throw error;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        ...state,
        createTask,
        updateTask,
        deleteTask,
        fetchTasks,
        batchUpdateStatus,
        batchDelete,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}; 