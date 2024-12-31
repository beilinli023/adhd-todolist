import type { Request, Response, NextFunction, RequestHandler } from 'express-serve-static-core';
import { Task } from '../models/Task';
import { CreateTaskDTO, UpdateTaskDTO, TaskQueryParams } from '../types/task';

interface AuthenticatedRequest extends Request {
  id: string;
  user: {
    id: string;
    email: string;
    name: string;
    preferences: Record<string, any>;
  };
}

// 创建任务
export const createTask: RequestHandler = async (req, res, next) => {
  try {
    const taskData: CreateTaskDTO = req.body;
    
    // 验证必填字段
    if (!taskData.title) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '任务标题是必需的',
        },
        timestamp: Date.now(),
        requestId: req.id,
      });
    }

    const task = new Task({
      ...taskData,
      user: req.user?.id,
    });

    const savedTask = await task.save();
    
    res.status(201).json({
      success: true,
      data: savedTask,
      message: '任务创建成功',
      timestamp: Date.now(),
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
};

// 获取任务列表
export const getTasks: RequestHandler = async (req, res, next) => {
  try {
    const queryParams: TaskQueryParams = req.query;
    const {
      status,
      priority,
      search,
      category,
      tags,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryParams;

    // 构建查询条件
    const query: any = { user: req.user?.id };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (tags?.length) query.tags = { $in: tags };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.dueDate = {};
      if (startDate) query.dueDate.$gte = new Date(startDate);
      if (endDate) query.dueDate.$lte = new Date(endDate);
    }

    // 计算分页
    const skip = (page - 1) * limit;
    
    // 执行查询
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        items: tasks,
        total,
        page,
        limit,
        hasMore: skip + tasks.length < total,
      },
      message: '获取任务列表成功',
      timestamp: Date.now(),
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
};

// 获取单个任务
export const getTaskById: RequestHandler = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user?.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: '任务不存在',
        },
        timestamp: Date.now(),
        requestId: req.id,
      });
    }

    res.json({
      success: true,
      data: task,
      message: '获取任务成功',
      timestamp: Date.now(),
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
};

// 更新任务
export const updateTask: RequestHandler = async (req, res, next) => {
  try {
    const updateData: UpdateTaskDTO = req.body;
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user?.id,
      },
      updateData,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: '任务不存在',
        },
        timestamp: Date.now(),
        requestId: req.id,
      });
    }

    res.json({
      success: true,
      data: task,
      message: '任务更新成功',
      timestamp: Date.now(),
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
};

// 更新任务状态
export const updateTaskStatus: RequestHandler = async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user?.id,
      },
      {
        status,
        completedAt: status === 'completed' ? new Date() : null,
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: '任务不存在',
        },
        timestamp: Date.now(),
        requestId: req.id,
      });
    }

    res.json({
      success: true,
      data: task,
      message: '任务状态更新成功',
      timestamp: Date.now(),
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
};

// 删除任务
export const deleteTask: RequestHandler = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user?.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: '任务不存在',
        },
        timestamp: Date.now(),
        requestId: req.id,
      });
    }

    res.json({
      success: true,
      data: null,
      message: '任务删除成功',
      timestamp: Date.now(),
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
};

// 批量更新任务状态
export const batchUpdateTaskStatus: RequestHandler = async (req, res, next) => {
  try {
    const { ids, status } = req.body;

    // 验证所有 ID 是否有效
    if (!Array.isArray(ids) || !ids.length || !ids.every((id: string) => /^[0-9a-fA-F]{24}$/.test(id))) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '无效的任务ID列表',
        },
        timestamp: Date.now(),
        requestId: req.id,
      });
    }

    const result = await Task.updateMany(
      {
        _id: { $in: ids },
        user: req.user?.id,
      },
      {
        $set: {
          status,
          completedAt: status === 'completed' ? new Date() : null,
        }
      }
    );

    res.json({
      success: true,
      data: {
        success: result.modifiedCount,
        failed: ids.length - result.modifiedCount,
      },
      message: '批量更新任务状态成功',
      timestamp: Date.now(),
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
};

// 批量删除任务
export const batchDeleteTasks: RequestHandler = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const result = await Task.deleteMany({
      _id: { $in: ids },
      user: req.user?.id,
    });

    res.json({
      success: true,
      data: {
        success: result.deletedCount,
        failed: ids.length - result.deletedCount,
      },
      message: '批量删除任务成功',
      timestamp: Date.now(),
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}; 