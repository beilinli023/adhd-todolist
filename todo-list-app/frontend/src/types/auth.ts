// 用户相关类型定义
export interface User {
  id: string;
  email: string;
  name: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
}

// 登录请求
export interface LoginRequest {
  email: string;
  password: string;
}

// 注册请求
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// 认证响应
export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  error?: {
    code?: string;
    message: string;
  };
}

// 认证上下文状态
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
} 