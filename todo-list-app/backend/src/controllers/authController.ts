import type { Request, Response } from 'express-serve-static-core';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { RegisterDTO, LoginDTO, toUserDTO } from '../types/user';

export const register = async (req: Request<{}, {}, RegisterDTO>, res: Response) => {
  try {
    console.log('收到注册请求:', req.body);
    const { email, password, name } = req.body;

    // 验证必填字段
    if (!email || !password || !name) {
      console.log('注册验证失败: 缺少必填字段');
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '邮箱、密码和用户名为必填项',
        },
      });
    }

    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('注册失败: 邮箱已存在', email);
      return res.status(400).json({
        success: false,
        error: {
          message: '该邮箱已被注册',
        },
      });
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
    console.log('用户创建成功:', user._id);

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    const responseData = {
      token,
      user: toUserDTO(user),
    };
    console.log('注册成功，返回数据:', responseData);

    res.status(201).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('注册过程中发生错误:', error);
    res.status(500).json({
      success: false,
      error: {
        message: '注册失败，请稍后重试',
      },
    });
  }
};

export const login = async (req: Request<{}, {}, LoginDTO>, res: Response) => {
  try {
    const { email, password } = req.body;

    // 验证必填字段
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '邮箱和密码为必填项',
        },
      });
    }

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: '邮箱或密码错误',
        },
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: '邮箱或密码错误',
        },
      });
    }

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: toUserDTO(user),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: '登录失败，请稍后重试',
      },
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '未授权访问',
        },
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: '获取用户信息失败',
      },
    });
  }
}; 