import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  batchOperation
} from '../controllers/taskController';

const router = Router();

// 所有路由都需要认证
router.use('/', auth);

// 创建任务
router.post('/', createTask);

// 获取任务列表
router.get('/', getTasks);

// 批量操作
router.post('/batch', batchOperation);

// 获取单个任务
router.get('/:id', getTaskById);

// 更新任务
router.put('/:id', updateTask);

// 删除任务
router.delete('/:id', deleteTask);

export default router; 