import React, { createContext, useContext, useState, useEffect } from 'react';
// User类型被AuthState接口间接使用，用于定义user字段的类型
// 虽然TypeScript显示未使用，但实际通过AuthState在整个认证上下文中都在使用
import type { User, AuthState } from '../types/auth';
import { authService } from '../services/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const initAuth = async () => {
      console.log('初始化认证状态...');
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log('发现存储的 token，尝试获取用户信息');
          const user = await authService.getCurrentUser();
          console.log('获取用户信息成功:', user);
          setState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            isLoading: false,
          }));
        } catch (error) {
          console.error('获取用户信息失败，清除 token:', error);
          localStorage.removeItem('token');
          setState(prev => ({
            ...prev,
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: '会话已过期，请重新登录',
          }));
        }
      } else {
        console.log('未找到存储的 token');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('开始登录请求...');
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const { token, user } = await authService.login({ email, password });
      console.log('登录成功，保存 token 和用户信息');
      localStorage.setItem('token', token);
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('登录失败:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '登录失败，请检查邮箱和密码',
      }));
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log('开始注册请求...');
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const { token, user } = await authService.register({ email, password, name });
      console.log('注册成功，保存 token 和用户信息');
      localStorage.setItem('token', token);
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('注册失败:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '注册失败，请稍后重试',
      }));
      throw error;
    }
  };

  const logout = () => {
    console.log('执行登出操作');
    authService.logout();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 