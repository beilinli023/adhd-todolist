import express = require('express');
import type { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from 'express-serve-static-core';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/database';
import { requestId } from './middleware/requestId';
import taskRoutes from './routes/taskRoutes';
import authRoutes from './routes/authRoutes';

// 初始化 Express 应用
export const app = express();

// 连接数据库
connectDB().catch(console.error);

// CORS 配置
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// 中间件
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));
app.use(requestId);

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// 错误处理中间件
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '服务器内部错误',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
    timestamp: Date.now(),
    requestId: req.id,
  });
};

app.use(errorHandler);

// 启动服务器
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
  });
} 