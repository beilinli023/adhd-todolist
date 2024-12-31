/// <reference types="jest" />

import { jest } from '@jest/globals';

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

// 设置测试超时时间
jest.setTimeout(30000);

// 全局错误处理
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
}); 