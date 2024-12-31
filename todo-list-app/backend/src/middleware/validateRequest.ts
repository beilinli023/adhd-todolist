import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

// 创建验证中间件
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 合并所有可能的请求数据来源
      const data = {
        ...req.body,
        ...req.query,
        ...req.params,
      };

      // 验证数据
      await schema.parseAsync(data);
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // 格式化 Zod 验证错误
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '请求数据验证失败',
            details: formattedErrors,
          },
          timestamp: Date.now(),
          requestId: req.id, // 假设使用了请求ID中间件
        });
      }

      // 其他错误交给全局错误处理器
      next(error);
    }
  };
}; 