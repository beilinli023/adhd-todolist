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
export interface UpdateTaskDTO extends Partial<CreateTaskDTO> {
  status?: 'pending' | 'in_progress' | 'completed' | 'archived';
}

// 任务查询参数
export interface TaskQueryParams {
  status?: 'pending' | 'in_progress' | 'completed' | 'archived';
  priority?: 'low' | 'medium' | 'high';
  search?: string;
  category?: string;
  tags?: string | string[];
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 批量操作请求 DTO
export interface BatchOperationDTO {
  taskIds: string[];
  action: 'update_status' | 'delete';
  data?: {
    status?: 'pending' | 'in_progress' | 'completed' | 'archived';
  };
}

// API 响应包装器类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// 错误响应类型
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
} 