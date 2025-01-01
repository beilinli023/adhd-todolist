import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import { createServer } from 'net';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// 检查端口是否被占用
const checkPort = (port: number, maxAttempts: number = 10): Promise<number> => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const tryPort = (currentPort: number): void => {
      attempts++;
      const server = createServer();
      
      server.once('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`端口 ${currentPort} 已被占用，尝试端口 ${currentPort + 1} (尝试 ${attempts}/${maxAttempts})`);
          if (attempts >= maxAttempts) {
            reject(new Error(`在 ${maxAttempts} 次尝试后未找到可用端口`));
            return;
          }
          tryPort(currentPort + 1);
        } else {
          reject(err);
        }
      });
      
      server.once('listening', () => {
        server.close();
        resolve(currentPort);
      });
      
      server.listen(currentPort);
    };
    
    tryPort(port);
  });
};

// 优雅关闭服务器
const gracefulShutdown = (server: any) => {
  ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
    process.on(signal, () => {
      console.log(`收到 ${signal} 信号，正在优雅关闭服务器...`);
      server.close(() => {
        console.log('已关闭所有连接');
        process.exit(0);
      });
      
      // 如果在 5 秒内没有完成关闭，则强制退出
      setTimeout(() => {
        console.log('无法优雅关闭，强制退出');
        process.exit(1);
      }, 5000);
    });
  });
};

// 启动服务器
const startServer = async () => {
  try {
    // 连接数据库
    console.log('正在连接数据库...');
    await connectDB();
    console.log('数据库连接成功');
    
    // 检查并获取可用端口
    console.log(`正在检查端口 ${port} 是否可用...`);
    const availablePort = await checkPort(Number(port));
    console.log(`将使用端口 ${availablePort}`);
    
    // 启动服务器
    const server = app.listen(availablePort, () => {
      console.log(`服务器运行在 http://localhost:${availablePort}`);
      console.log('环境:', process.env.NODE_ENV);
    });
    
    // 设置优雅关闭
    gracefulShutdown(server);
    
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
});

startServer(); 