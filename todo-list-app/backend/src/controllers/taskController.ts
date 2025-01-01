import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task';
import type { ITask } from '../models/Task';

interface BatchOperationDTO {
  taskIds: string[];
  action: 'update_status' | 'delete';
  data?: {
    status?: 'pending' | 'in_progress' | 'completed' | 'archived';
  };
}

// 获取任务列表
export const getTasks = async (req: Request, res: Response) => {
  try {
    const {
      status,
      priority,
      search,
      sortBy = 'order',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    // 构建查询条件
    const query: any = { user: req.user?.id };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 计算总数
    const total = await Task.countDocuments(query);

    // 获取分页数据
    const tasks = await Task.find(query)
      .sort({ [sortBy as string]: sortOrder === 'desc' ? -1 : 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        tasks,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('获取任务列表失败:', error);
    res.status(500).json({ success: false, error: '获取任务列表失败' });
  }
};

// 获取单个任务
export const getTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user?.id
    });

    if (!task) {
      return res.status(404).json({ success: false, error: '任务不存在' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('获取任务详情失败:', error);
    res.status(500).json({ success: false, error: '获取任务详情失败' });
  }
};

// 创建任务
export const createTask = async (req: Request, res: Response) => {
  try {
    // 获取最大的 order 值
    const maxOrderTask = await Task.findOne({ user: req.user?.id })
      .sort({ order: -1 })
      .select('order');
    
    const newOrder = maxOrderTask ? maxOrderTask.order + 1 : 0;

    const task = new Task({
      ...req.body,
      user: req.user?.id,
      order: newOrder
    });

    await task.save();
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error('创建任务失败:', error);
    res.status(500).json({ success: false, error: '创建任务失败' });
  }
};

// 更新任务
export const updateTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user?.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, error: '任务不存在' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('更新任务失败:', error);
    res.status(500).json({ success: false, error: '更新任务失败' });
  }
};

// 删除任务
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user?.id
    });

    if (!task) {
      return res.status(404).json({ success: false, error: '任务不存在' });
    }

    res.json({ success: true, message: '任务删除成功' });
  } catch (error) {
    console.error('删除任务失败:', error);
    res.status(500).json({ success: false, error: '删除任务失败' });
  }
};

// 批量操作
export const batchOperation = async (req: Request, res: Response) => {
  try {
    const { taskIds, action, data }: BatchOperationDTO = req.body;

    // 验证必填参数
    if (!taskIds || !Array.isArray(taskIds) || !action) {
      return res.status(400).json({ success: false, error: '无效的请求参数' });
    }

    // 验证任务ID格式
    if (!taskIds.every(id => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ success: false, error: '存在无效的任务ID' });
    }

    let result;

    switch (action) {
      case 'update_status':
        if (!data?.status || !['pending', 'in_progress', 'completed', 'archived'].includes(data.status)) {
          return res.status(400).json({ success: false, error: '无效的状态值' });
        }

        result = await Task.updateMany(
          {
            _id: { $in: taskIds },
            user: req.user?.id
          },
          {
            status: data.status,
            ...(data.status === 'completed' ? { completedAt: new Date() } : {})
          }
        );

        res.json({
          success: true,
          data: {
            modifiedCount: result.modifiedCount
          }
        });
        break;

      case 'delete':
        result = await Task.deleteMany({
          _id: { $in: taskIds },
          user: req.user?.id
        });

        res.json({
          success: true,
          data: {
            deletedCount: result.deletedCount
          }
        });
        break;

      default:
        return res.status(400).json({ success: false, error: '不支持的操作类型' });
    }
  } catch (error) {
    console.error('批量操作失败:', error);
    res.status(500).json({ success: false, error: '批量操作失败' });
  }
};

// 添加更新任务顺序的方法
export const updateTaskOrder = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { newOrder } = req.body;

    // 验证用户
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: '未授权' });
    }

    // 验证任务ID
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ success: false, error: '无效的任务ID' });
    }

    // 获取当前任务
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, error: '任务不存在' });
    }

    // 验证权限
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: '无权操作此任务' });
    }

    const oldOrder = task.order;

    // 更新受影响的任务顺序
    if (newOrder > oldOrder) {
      // 向下移动：更新中间任务的顺序
      await Task.updateMany(
        {
          user: req.user.id,
          order: { $gt: oldOrder, $lte: newOrder }
        },
        { $inc: { order: -1 } }
      );
    } else if (newOrder < oldOrder) {
      // 向上移动：更新中间任务的顺序
      await Task.updateMany(
        {
          user: req.user.id,
          order: { $gte: newOrder, $lt: oldOrder }
        },
        { $inc: { order: 1 } }
      );
    }

    // 更新当前任务的顺序
    task.order = newOrder;
    await task.save();

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('更新任务顺序失败:', error);
    res.status(500).json({ success: false, error: '更新任务顺序失败' });
  }
};

// 批量更新任务顺序
export const updateTasksOrder = async (req: Request, res: Response) => {
  try {
    const { tasks } = req.body;

    // 验证用户
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: '未授权' });
    }

    // 验证任务数组
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ success: false, error: '无效的任务数组' });
    }

    // 批量更新任务顺序
    const updateOperations = tasks.map(({ _id, order }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(_id), user: req.user?.id },
        update: { $set: { order } }
      }
    }));

    const result = await Task.bulkWrite(updateOperations);

    res.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('批量更新任务顺序失败:', error);
    res.status(500).json({ success: false, error: '批量更新任务顺序失败' });
  }
}; 