import { Request, Response, NextFunction, RequestHandler } from 'express-serve-static-core';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

interface JwtPayload {
  userId: string;
  email: string;
}

export const auth: RequestHandler = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '请先登录',
        },
        timestamp: Date.now(),
        requestId: req.id,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '用户不存在',
        },
        timestamp: Date.now(),
        requestId: req.id,
      });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      preferences: user.preferences,
    } as NonNullable<typeof req.user>;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '认证失败',
        details: error instanceof Error ? error.message : undefined,
      },
      timestamp: Date.now(),
      requestId: req.id,
    });
  }
}; 