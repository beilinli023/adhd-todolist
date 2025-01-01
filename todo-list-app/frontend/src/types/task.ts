// 任务状态
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'archived';

// 任务优先级
export type TaskPriority = 'low' | 'medium' | 'high';

// 任务类型
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  tags?: string[];
  category?: string;
  createdAt: string;
  updatedAt: string;
  user: string;
}

// 创建任务请求
export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  tags?: string[];
  category?: string;
}

// 更新任务请求
export interface UpdateTaskDTO extends Partial<CreateTaskDTO> {
  status?: TaskStatus;
}

// 任务查询参数
export interface TaskQueryParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  category?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 批量操作请求
export interface BatchOperationDTO {
  taskIds: string[];
  action: 'update_status' | 'delete';
  data?: {
    status?: TaskStatus;
  };
}

// 任务列表响应
export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  totalPages: number;
} 