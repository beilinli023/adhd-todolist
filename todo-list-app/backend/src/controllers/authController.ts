import type { Request, Response } from 'express-serve-static-core';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { RegisterDTO, LoginDTO, AuthResponse } from '../types/auth';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    preferences: Record<string, any>;
  };
}

export const register = async (req: Request<{}, {}, RegisterDTO>, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const user = new User({
      email,
      password: hashedPassword,
      name,
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'zh-CN',
      },
    });

    await user.save();

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const response: AuthResponse = {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        preferences: user.preferences,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
};

export const login = async (req: Request<{}, {}, LoginDTO>, res: Response) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const user = await User.findOne({ email }) as IUser | null;
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const response: AuthResponse = {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        preferences: user.preferences,
      },
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: '未授权访问' });
    }
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      preferences: user.preferences,
    });
  } catch (error) {
    res.status(500).json({ error: '获取用户信息失败' });
  }
}; 