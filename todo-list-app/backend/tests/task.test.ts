/// <reference types="jest" />
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../src/app';
import { User } from '../src/models/User';
import { Task } from '../src/models/Task';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { describe, it, beforeAll, afterAll, beforeEach, expect } from '@jest/globals';

describe('Task API Tests', () => {
  let mongoServer: MongoMemoryServer;
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    // 创建内存数据库
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // 清理集合
    await User.deleteMany({});
    await Task.deleteMany({});

    // 创建测试用户
    testUser = await User.create({
      email: 'test@example.com',
      password: await bcrypt.hash('Password123!', 10),
      name: 'Test User'
    });

    // 生成认证令牌
    authToken = jwt.sign(
      { userId: testUser._id, email: testUser.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const taskData = {
        title: '测试任务',
        description: '这是一个测试任务的描述',
        priority: 'medium',
        dueDate: tomorrow.toISOString(),
        tags: ['工作', '重要'],
        user: testUser._id
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        tags: taskData.tags,
        status: 'pending'
      });
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should not create task without authentication', async () => {
      const taskData = {
        title: '测试任务',
        description: '这是一个测试任务的描述'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // 创建测试任务
      await Task.create([
        {
          title: '高优先级任务',
          description: '这是一个高优先级任务',
          priority: 'high',
          status: 'pending',
          dueDate: tomorrow,
          user: testUser._id,
          tags: ['重要', '工作']
        },
        {
          title: '已完成任务',
          description: '这是一个已完成的任务',
          priority: 'low',
          status: 'completed',
          dueDate: tomorrow,
          user: testUser._id,
          tags: ['个人']
        },
        {
          title: '普通任务',
          description: '这是一个普通任务',
          priority: 'medium',
          status: 'pending',
          dueDate: tomorrow,
          user: testUser._id,
          tags: ['学习']
        }
      ]);
    });

    it('should get all tasks for authenticated user', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(3);
      expect(response.body.data.total).toBe(3);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ status: 'completed' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].status).toBe('completed');
    });

    it('should filter tasks by priority', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ priority: 'high' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].priority).toBe('high');
    });

    it('should filter tasks by tags', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ tags: '工作' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].tags).toContain('工作');
    });

    it('should sort tasks by dueDate', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ sort: 'dueDate:desc' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(3);
      // 验证排序
      const dueDates = response.body.data.tasks.map((t: any) => new Date(t.dueDate).getTime());
      expect(dueDates).toEqual([...dueDates].sort((a, b) => b - a));
    });

    it('should paginate tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ page: 1, limit: 2 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(2);
      expect(response.body.data.total).toBe(3);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.totalPages).toBe(2);
    });
  });

  describe('GET /api/tasks/:id', () => {
    let testTask: any;

    beforeEach(async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      testTask = await Task.create({
        title: '测试任务',
        description: '这是一个测试任务',
        priority: 'medium',
        status: 'pending',
        dueDate: tomorrow,
        user: testUser._id,
        tags: ['测试']
      });
    });

    it('should get task by id', async () => {
      const response = await request(app)
        .get(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        title: testTask.title,
        description: testTask.description,
        priority: testTask.priority,
        status: testTask.status
      });
    });

    it('should not get task with invalid id', async () => {
      const response = await request(app)
        .get('/api/tasks/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_ID');
    });

    it('should not get task from another user', async () => {
      // 创建另一个用户的任务
      const anotherUser = await User.create({
        email: 'another@example.com',
        password: await bcrypt.hash('Password123!', 10),
        name: 'Another User'
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const anotherTask = await Task.create({
        title: '另一个用户的任务',
        description: '这是另一个用户的任务',
        priority: 'medium',
        status: 'pending',
        dueDate: tomorrow,
        user: anotherUser._id,
        tags: ['测试']
      });

      const response = await request(app)
        .get(`/api/tasks/${anotherTask._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let testTask: any;

    beforeEach(async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      testTask = await Task.create({
        title: '测试任务',
        description: '这是一个测试任务',
        priority: 'medium',
        status: 'pending',
        dueDate: tomorrow,
        user: testUser._id,
        tags: ['测试']
      });
    });

    it('should update task', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const updateData = {
        title: '更新后的任务',
        description: '这是更新后的任务描述',
        priority: 'high',
        status: 'in_progress',
        dueDate: tomorrow.toISOString()
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(updateData);
    });

    it('should not update task with invalid data', async () => {
      const response = await request(app)
        .put(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          priority: 'invalid-priority'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let testTask: any;

    beforeEach(async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      testTask = await Task.create({
        title: '测试任务',
        description: '这是一个测试任务',
        priority: 'medium',
        status: 'pending',
        dueDate: tomorrow,
        user: testUser._id,
        tags: ['测试']
      });
    });

    it('should delete task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // 验证任务已被删除
      const deletedTask = await Task.findById(testTask._id);
      expect(deletedTask).toBeNull();
    });

    it('should not delete task from another user', async () => {
      // 创建另一个用户的任务
      const anotherUser = await User.create({
        email: 'another@example.com',
        password: await bcrypt.hash('Password123!', 10),
        name: 'Another User'
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const anotherTask = await Task.create({
        title: '另一个用户的任务',
        description: '这是另一个用户的任务',
        priority: 'medium',
        status: 'pending',
        dueDate: tomorrow,
        user: anotherUser._id,
        tags: ['测试']
      });

      const response = await request(app)
        .delete(`/api/tasks/${anotherTask._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');

      // 验证任务未被删除
      const task = await Task.findById(anotherTask._id);
      expect(task).not.toBeNull();
    });
  });

  describe('POST /api/tasks/batch', () => {
    let testTasks: any[];

    beforeEach(async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      testTasks = await Task.create([
        {
          title: '任务1',
          description: '这是任务1',
          priority: 'medium',
          status: 'pending',
          dueDate: tomorrow,
          user: testUser._id,
          tags: ['测试']
        },
        {
          title: '任务2',
          description: '这是任务2',
          priority: 'high',
          status: 'pending',
          dueDate: tomorrow,
          user: testUser._id,
          tags: ['测试']
        }
      ]);
    });

    it('should update multiple tasks status', async () => {
      const taskIds = testTasks.map(task => task._id.toString());
      const response = await request(app)
        .post('/api/tasks/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          taskIds,
          action: 'update_status',
          data: { status: 'completed' }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.modifiedCount).toBe(2);

      // 验证任务状态已更新
      const updatedTasks = await Task.find({ _id: { $in: taskIds } });
      expect(updatedTasks).toHaveLength(2);
      expect(updatedTasks.every(task => task.status === 'completed')).toBe(true);
    });

    it('should delete multiple tasks', async () => {
      const taskIds = testTasks.map(task => task._id.toString());
      const response = await request(app)
        .post('/api/tasks/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          taskIds,
          action: 'delete'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.deletedCount).toBe(2);

      // 验证任务已被删除
      const remainingTasks = await Task.find({ _id: { $in: taskIds } });
      expect(remainingTasks).toHaveLength(0);
    });

    it('should validate batch action', async () => {
      const taskIds = testTasks.map(task => task._id.toString());
      const response = await request(app)
        .post('/api/tasks/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          taskIds,
          action: 'invalid_action'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
}); 