import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  batchOperation,
  updateTaskOrder,
  updateTasksOrder
} from '../controllers/taskController';

const router = express.Router();

// 应用认证中间件到所有路由
router.use(authenticateToken);

// 基本的 CRUD 路由
router.post('/', createTask);
router.get('/', getTasks);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

// 批量操作路由
router.post('/batch', batchOperation);

// 任务排序路由
router.patch('/:taskId/order', updateTaskOrder);
router.patch('/batch/order', updateTasksOrder);

export default router; 