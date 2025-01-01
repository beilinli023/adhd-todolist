import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

interface JwtPayload {
  userId: string;
}

// 扩展 Request 类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: '未提供认证令牌'
        }
      });
    }

    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET 未定义');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = {
      id: decoded.userId
    };
    next();
  } catch (error) {
    console.error('认证失败:', error);
    return res.status(403).json({
      success: false,
      error: {
        message: '无效的认证令牌'
      }
    });
  }
}; 