import type { Request, Response, NextFunction, RequestHandler } from 'express-serve-static-core';
import { Task } from '../models/Task';
import { CreateTaskDTO, UpdateTaskDTO, TaskQueryParams, BatchOperationDTO } from '../types/task';
import mongoose from 'mongoose';

// 创建任务
export const createTask: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
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
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }
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
    if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
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
    const skip = (Number(page) - 1) * Number(limit);
    
    // 执行查询
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(Number(limit)),
      Task.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        tasks,
        total,
        page: Number(page),
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 获取单个任务
export const getTaskById: RequestHandler = async (req, res, next) => {
  try {
    // 验证 ID 格式
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: '无效的任务ID',
        },
      });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user?.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '任务不存在',
        },
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// 更新任务
export const updateTask: RequestHandler = async (req, res, next) => {
  try {
    // 验证 ID 格式
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: '无效的任务ID',
        },
      });
    }

    const updateData: UpdateTaskDTO = req.body;

    // 验证更新数据
    if (updateData.priority && !['low', 'medium', 'high'].includes(updateData.priority)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '无效的优先级值',
        },
      });
    }

    if (updateData.status && !['pending', 'in_progress', 'completed', 'archived'].includes(updateData.status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '无效的状态值',
        },
      });
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user?.id,
      },
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '任务不存在',
        },
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }
    next(error);
  }
};

// 删除任务
export const deleteTask: RequestHandler = async (req, res, next) => {
  try {
    // 验证 ID 格式
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: '无效的任务ID',
        },
      });
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user?.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '任务不存在',
        },
      });
    }

    res.json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// 批量操作
export const batchOperation: RequestHandler = async (req, res, next) => {
  try {
    const { taskIds, action, data }: BatchOperationDTO = req.body;

    // 验证必填参数
    if (!taskIds || !Array.isArray(taskIds) || !action) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '无效的请求参数',
        },
      });
    }

    // 验证任务ID格式
    if (!taskIds.every(id => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '存在无效的任务ID',
        },
      });
    }

    let result;

    switch (action) {
      case 'update_status':
        if (!data?.status || !['pending', 'in_progress', 'completed', 'archived'].includes(data.status)) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: '无效的状态值',
            },
          });
        }

        result = await Task.updateMany(
          {
            _id: { $in: taskIds },
            user: req.user?.id,
          },
          {
            status: data.status,
            ...(data.status === 'completed' ? { completedAt: new Date() } : {}),
          }
        );

        res.json({
          success: true,
          data: {
            modifiedCount: result.modifiedCount,
          },
        });
        break;

      case 'delete':
        result = await Task.deleteMany({
          _id: { $in: taskIds },
          user: req.user?.id,
        });

        res.json({
          success: true,
          data: {
            deletedCount: result.deletedCount,
          },
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '不支持的操作类型',
          },
        });
    }
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }
    next(error);
  }
}; 