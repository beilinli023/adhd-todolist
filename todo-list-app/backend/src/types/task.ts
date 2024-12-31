import { Types } from 'mongoose';

// 创建任务的请求 DTO
export interface CreateTaskDTO {
  title: string;          // 任务标题（1-200字符）
  description?: string;   // 任务描述（最多1000字符）
  priority: 'low' | 'medium' | 'high';  // 优先级
  dueDate?: string;      // 截止日期（ISO 8601格式）
  tags?: string[];       // 标签（最多10个）
  category?: string;     // 分类（最多50字符）
}

// 更新任务的请求 DTO
export interface UpdateTaskDTO extends Partial<CreateTaskDTO> {}

// 更新任务状态的请求 DTO
export interface UpdateTaskStatusDTO {
  status: TaskStatus;
}

// 批量更新任务状态的请求 DTO
export interface BatchUpdateTaskStatusDTO {
  ids: string[];
  status: TaskStatus;
}

// 批量删除任务的请求 DTO
export interface BatchDeleteTasksDTO {
  ids: string[];
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

// 任务响应类型
export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  tags: string[];
  category?: string;
  status: TaskStatus;
  user: Types.ObjectId;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 分页任务列表响应
export interface PaginatedTasksResponse {
  items: TaskResponse[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// 批量操作响应
export interface BatchOperationResponse {
  success: number;
  failed: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}

// 任务状态枚举
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

// 任务优先级枚举
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// API 响应包装器类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: number;
  requestId: string;
}

// 错误响应类型
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string;
    stack?: string;
  };
  timestamp: number;
  requestId: string;
} 