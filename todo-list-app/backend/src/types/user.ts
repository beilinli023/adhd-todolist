import { Document, Types } from 'mongoose';

// 基础类型定义
export interface BaseUserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

export interface BaseUser {
  email: string;
  password: string;
  name: string;
  isActive: boolean;
  preferences: BaseUserPreferences;
  lastLogin?: Date;
}

// Mongoose Model 类型
export interface IUser extends BaseUser, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// DTO 类型
export type UserDTO = Omit<BaseUser, 'password'> & {
  id: string;
};

// 认证相关 DTO
export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO extends LoginDTO {
  name: string;
}

// 类型转换函数
export const toUserDTO = (user: IUser): UserDTO => {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    isActive: user.isActive,
    preferences: {
      theme: user.preferences.theme,
      notifications: user.preferences.notifications,
      language: user.preferences.language
    },
    lastLogin: user.lastLogin
  };
};

// Express 类型扩展
declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: UserDTO;
    }
  }
} 