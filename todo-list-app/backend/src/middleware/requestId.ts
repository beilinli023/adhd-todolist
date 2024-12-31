import { Request, Response, NextFunction, RequestHandler } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestId: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  // 优先使用请求头中的请求ID，如果没有则生成新的
  req.id = req.headers['x-request-id'] as string || uuidv4();
  
  // 在响应头中也设置请求ID
  res.setHeader('x-request-id', req.id);
  
  next();
}; 