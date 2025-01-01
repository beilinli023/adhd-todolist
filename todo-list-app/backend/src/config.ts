import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 数据库配置
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-list';

// JWT 配置
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 服务器配置
export const PORT = process.env.PORT || 3001;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// 跨域配置
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'; 