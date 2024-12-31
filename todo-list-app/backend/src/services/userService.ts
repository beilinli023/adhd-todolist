import { User } from '../models/User';

export class UserService {
  async register(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    // TODO: 实现用户注册
    throw new Error('Not implemented');
  }

  async login(email: string, password: string): Promise<string> {
    // TODO: 实现用户登录
    throw new Error('Not implemented');
  }

  async getProfile(userId: string): Promise<User> {
    // TODO: 实现获取用户信息
    throw new Error('Not implemented');
  }
} 