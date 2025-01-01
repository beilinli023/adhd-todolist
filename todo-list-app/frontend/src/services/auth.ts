import { api } from './api';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

export const authService = {
  // 用户注册
  async register(data: RegisterRequest) {
    try {
      console.log('发送注册请求:', data);
      const response = await api.post<AuthResponse>('/api/auth/register', data);
      console.log('注册响应:', response.data);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || '注册失败');
      }
      return response.data.data;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  },

  // 用户登录
  async login(data: LoginRequest) {
    try {
      console.log('发送登录请求:', data);
      const response = await api.post<AuthResponse>('/api/auth/login', data);
      console.log('登录响应:', response.data);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || '登录失败');
      }
      return response.data.data;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  // 获取当前用户信息
  async getCurrentUser() {
    try {
      const response = await api.get<AuthResponse>('/api/auth/me');
      console.log('获取用户信息响应:', response.data);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || '获取用户信息失败');
      }
      return response.data.data.user;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  },

  // 退出登录
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}; 