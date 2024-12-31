/// <reference types="jest" />
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../src/app';
import { Task } from '../src/models/Task';
import { User } from '../src/models/User';
import { TaskStatus, TaskPriority } from '../src/types/task';
import jwt from 'jsonwebtoken';
import { describe, it, beforeAll, afterAll, beforeEach, expect } from '@jest/globals';

describe('Task API Tests', () => {
  let mongoServer: MongoMemoryServer;
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // 创建内存数据库
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // 创建测试用户
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    // 生成认证令牌
    authToken = jwt.sign(
      { userId: testUser._id, email: testUser.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // 清理任务集合
    await Task.deleteMany({});
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: '测试任务',
        description: '这是一个测试任务',
        priority: TaskPriority.MEDIUM,
        dueDate: new Date(Date.now() + 86400000).toISOString(), // 明天
        tags: ['测试', '重要'],
        category: '工作',
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
        category: taskData.category,
        user: testUser._id.toString(),
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
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // 创建一些测试任务
      await Task.create([
        {
          title: '任务1',
          priority: TaskPriority.HIGH,
          user: testUser._id,
          status: TaskStatus.PENDING,
        },
        {
          title: '任务2',
          priority: TaskPriority.LOW,
          user: testUser._id,
          status: TaskStatus.COMPLETED,
        },
      ]);
    });

    it('should get all tasks for the user', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ status: TaskStatus.PENDING })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].status).toBe(TaskStatus.PENDING);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ page: 1, limit: 1 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.hasMore).toBe(true);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let testTask: any;

    beforeEach(async () => {
      testTask = await Task.create({
        title: '测试任务',
        priority: TaskPriority.MEDIUM,
        user: testUser._id,
      });
    });

    it('should update a task', async () => {
      const updateData = {
        title: '更新后的任务',
        priority: TaskPriority.HIGH,
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.priority).toBe(updateData.priority);
    });

    it('should not update task of another user', async () => {
      const anotherUser = await User.create({
        email: 'another@example.com',
        password: 'password123',
        name: 'Another User',
      });

      const anotherTask = await Task.create({
        title: '另一个用户的任务',
        priority: TaskPriority.LOW,
        user: anotherUser._id,
      });

      const response = await request(app)
        .put(`/api/tasks/${anotherTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '尝试更新' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let testTask: any;

    beforeEach(async () => {
      testTask = await Task.create({
        title: '要删除的任务',
        priority: TaskPriority.LOW,
        user: testUser._id,
      });
    });

    it('should delete a task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const deletedTask = await Task.findById(testTask._id);
      expect(deletedTask).toBeNull();
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    let testTask: any;

    beforeEach(async () => {
      testTask = await Task.create({
        title: '状态测试任务',
        priority: TaskPriority.MEDIUM,
        user: testUser._id,
        status: TaskStatus.PENDING,
      });
    });

    it('should update task status', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${testTask._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: TaskStatus.COMPLETED });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe(TaskStatus.COMPLETED);
      expect(response.body.data.completedAt).toBeTruthy();
    });
  });

  describe('PATCH /api/tasks/batch/status', () => {
    let tasks: any[];

    beforeEach(async () => {
      tasks = await Task.create([
        {
          title: '批量任务1',
          priority: TaskPriority.LOW,
          user: testUser._id,
          status: TaskStatus.PENDING,
        },
        {
          title: '批量任务2',
          priority: TaskPriority.MEDIUM,
          user: testUser._id,
          status: TaskStatus.PENDING,
        },
      ]);
    });

    it('should update multiple tasks status', async () => {
      const response = await request(app)
        .patch('/api/tasks/batch/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ids: tasks.map(task => task._id.toString()),
          status: TaskStatus.COMPLETED,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.success).toBe(2);
      expect(response.body.data.failed).toBe(0);

      const updatedTasks = await Task.find({
        _id: { $in: tasks.map(task => task._id) },
      });
      expect(updatedTasks.every(task => task.status === TaskStatus.COMPLETED)).toBe(true);
    });

    it('should handle invalid task IDs', async () => {
      const response = await request(app)
        .patch('/api/tasks/batch/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ids: ['invalid-id'],
          status: TaskStatus.COMPLETED,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
}); 