# 技术规范文档

## 目录
1. [API 设计规范](#api-设计规范)
2. [安全规范](#安全规范)
3. [数据库模式](#数据库模式)
4. [组件结构](#组件结构)

## API 设计规范

### 1. 基础规范

#### 1.1 请求格式
- 基础路径: `/api/v1`
- 内容类型: `application/json`
- 字符编码: `UTF-8`
- 请求头要求:
  ```
  Content-Type: application/json
  Authorization: Bearer <token>  // 需要认证的接口
  Accept-Language: zh-CN        // 可选，默认 zh-CN
  ```

#### 1.2 认证方式
- 使用 Bearer Token 认证
- Token 通过 Authorization 请求头传递
- 格式: `Authorization: Bearer <token>`
- Token 有效期: 24小时
- 无效 Token 处理: 返回 401 状态码

#### 1.3 响应格式
```typescript
// 成功响应
{
  "success": true,
  "data": any,
  "message": string,
  "timestamp": number,      // 响应时间戳
  "requestId": string      // 请求追踪ID
}

// 错误响应
{
  "success": false,
  "error": {
    "code": string,        // 错误码
    "message": string,     // 错误消息
    "details"?: any,       // 详细错误信息
    "field"?: string,      // 出错的字段（验证错误时）
    "stack"?: string       // 开发环境下的堆栈信息
  },
  "timestamp": number,
  "requestId": string
}

// 分页响应格式
{
  "success": true,
  "data": {
    "items": T[],         // 数据项数组
    "total": number,      // 总条数
    "page": number,       // 当前页码
    "limit": number,      // 每页条数
    "hasMore": boolean    // 是否有更多数据
  },
  "timestamp": number,
  "requestId": string
}
```

### 2. API 端点

#### 2.1 认证接口
```typescript
// 用户注册
POST /api/auth/register
Request:
{
  email: string;    // 邮箱
  password: string; // 密码（最少6位）
  name: string;     // 用户名（2-50字符）
}
Response: {
  success: true,
  data: {
    token: string,    // JWT token
    user: {
      id: string,
      email: string,
      name: string,
      preferences: {
        theme: 'light' | 'dark',
        notifications: boolean,
        language: string
      },
      createdAt: string,
      lastLogin: string
    }
  },
  message: "注册成功"
}

// 用户登录
POST /api/auth/login
Request:
{
  email: string,
  password: string,
  remember?: boolean  // 是否记住登录状态
}
Response: 同注册接口

// 获取当前用户信息
GET /api/auth/me
Response: {
  success: true,
  data: {
    id: string,
    email: string,
    name: string,
    preferences: {
      theme: 'light' | 'dark',
      notifications: boolean,
      language: string
    },
    createdAt: string,
    lastLogin: string,
    taskStats: {
      total: number,
      completed: number,
      pending: number,
      overdue: number
    }
  }
}

// 更新用户偏好设置
PATCH /api/auth/preferences
Request:
{
  theme?: 'light' | 'dark',
  notifications?: boolean,
  language?: string
}
Response: {
  success: true,
  data: {
    preferences: {
      theme: 'light' | 'dark',
      notifications: boolean,
      language: string
    }
  }
}
```

#### 2.2 任务接口
```typescript
// 创建任务
POST /api/tasks
Request:
{
  title: string;          // 任务标题（1-200字符）
  description?: string;   // 任务描述（最多1000字符）
  priority: 'low' | 'medium' | 'high';  // 优先级
  dueDate?: string;      // 截止日期（ISO 8601格式）
  tags?: string[];       // 标签（最多10个）
  category?: string;     // 分类（最多50字符）
}
Response: {
  success: true,
  data: {
    id: string,
    title: string,
    description: string,
    priority: string,
    dueDate: string,
    tags: string[],
    category: string,
    status: string,
    createdAt: string,
    updatedAt: string
  },
  message: "任务创建成功"
}

// 获取任务列表
GET /api/tasks
Query Parameters:
- status: 'pending' | 'in_progress' | 'completed' | 'archived'
- priority: 'low' | 'medium' | 'high'
- search: string        // 搜索标题和描述
- category: string      // 按分类筛选
- tags: string[]        // 按标签筛选
- startDate: string    // 开始日期
- endDate: string      // 结束日期
- page: number         // 页码（默认1）
- limit: number        // 每页条数（默认20，最大50）
- sortBy: string       // 排序字段
- sortOrder: 'asc' | 'desc'  // 排序方向
Response: {
  success: true,
  data: {
    items: [{
      id: string,
      title: string,
      description: string,
      priority: string,
      dueDate: string,
      tags: string[],
      category: string,
      status: string,
      createdAt: string,
      updatedAt: string
    }],
    total: number,
    page: number,
    limit: number,
    hasMore: boolean
  }
}

// 更新任务
PUT /api/tasks/:id
Request: 同创建任务
Response: {
  success: true,
  data: Task,
  message: "任务更新成功"
}

// 更新任务状态
PATCH /api/tasks/:id/status
Request:
{
  status: 'pending' | 'in_progress' | 'completed' | 'archived'
}
Response: {
  success: true,
  data: {
    id: string,
    status: string,
    completedAt?: string
  },
  message: "任务状态更新成功"
}

// 批量更新任务状态
PATCH /api/tasks/batch/status
Request:
{
  ids: string[],
  status: 'pending' | 'in_progress' | 'completed' | 'archived'
}
Response: {
  success: true,
  data: {
    updated: number,
    failed: number
  },
  message: "任务状态批量更新成功"
}

// 删除任务
DELETE /api/tasks/:id
Response: {
  success: true,
  message: "任务删除成功"
}

// 批量删除任务
DELETE /api/tasks/batch
Request:
{
  ids: string[]
}
Response: {
  success: true,
  data: {
    deleted: number,
    failed: number
  },
  message: "任务批量删除成功"
}
```

### 3. 错误码规范

#### 3.1 HTTP 状态码使用
- 200: 成功
- 201: 创建成功
- 400: 请求参数错误
- 401: 未认证/认证失败
- 403: 无权限访问
- 404: 资源不存在
- 409: 资源冲突
- 422: 请求参数验证失败
- 429: 请求过于频繁
- 500: 服务器内部错误

#### 3.2 业务错误码
```typescript
enum ErrorCode {
  // 系统级错误 (SYS)
  SYSTEM_ERROR = 'SYS001',           // 系统内部错误
  INVALID_REQUEST = 'SYS002',        // 无效的请求
  SERVICE_UNAVAILABLE = 'SYS003',    // 服务不可用
  RATE_LIMIT_EXCEEDED = 'SYS004',    // 请求频率超限
  
  // 认证相关 (AUTH)
  AUTH_INVALID_CREDENTIALS = 'AUTH001',  // 无效的凭证
  AUTH_TOKEN_EXPIRED = 'AUTH002',        // Token已过期
  AUTH_TOKEN_INVALID = 'AUTH003',        // 无效的Token
  AUTH_TOKEN_MISSING = 'AUTH004',        // Token缺失
  AUTH_INVALID_REFRESH = 'AUTH005',      // 无效的刷新Token
  
  // 用户相关 (USER)
  USER_NOT_FOUND = 'USER001',           // 用户不存在
  USER_ALREADY_EXISTS = 'USER002',      // 用户已存在
  USER_INACTIVE = 'USER003',            // 用户未激活
  USER_INVALID_PASSWORD = 'USER004',    // 密码错误
  USER_UPDATE_FAILED = 'USER005',       // 用户更新失败
  
  // 任务相关 (TASK)
  TASK_NOT_FOUND = 'TASK001',           // 任务不存在
  TASK_VALIDATION_ERROR = 'TASK002',    // 任务验证错误
  TASK_ACCESS_DENIED = 'TASK003',       // 无权访问任务
  TASK_UPDATE_FAILED = 'TASK004',       // 任务更新失败
  TASK_DELETE_FAILED = 'TASK005',       // 任务删除失败
  TASK_STATUS_INVALID = 'TASK006',      // 无效的任务状态
  
  // 数据验证 (VAL)
  VALIDATION_REQUIRED = 'VAL001',       // 必填字段缺失
  VALIDATION_FORMAT = 'VAL002',         // 格式错误
  VALIDATION_LENGTH = 'VAL003',         // 长度错误
  VALIDATION_RANGE = 'VAL004'           // 范围错误
}
```

## 安全规范

### 1. 认证安全
- 密码加密：使用 bcrypt 加密存储
- Token 安全：
  - 使用 JWT 签名
  - 设置合理的过期时间
  - 支持 Token 刷新机制
  - 支持 Token 吊销

### 2. 请求安全
- 使用 HTTPS 传输
- 实现 CORS 策略
- 添加请求频率限制
- 验证请求来源
- 防止 CSRF 攻击

### 3. 数据安全
- 输入验证和清理
- 防止 SQL 注入
- 防止 XSS 攻击
- 敏感数据加密
- 日志脱敏处理

### 4. 访问控制
- 基于角色的访问控制（RBAC）
- API 访问权限控制
- 资源所有权验证
- 操作审计日志

### 5. 安全配置
- 环境变量管理
- 密钥定期轮换
- 错误信息处理
- 超时设置
- 会话管理

### 6. 安全监控
- 异常访问检测
- 失败登录监控
- 敏感操作告警
- 安全日志分析

## 数据库模式

### 1. User 模型
```typescript
interface IUser {
  email: string;          // 邮箱（唯一）
  password: string;       // 加密后的密码
  name: string;          // 用户名
  avatar?: string;       // 头像URL
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  lastLogin?: Date;     // 最后登录时间
  isActive: boolean;    // 账户状态
  createdAt: Date;      // 创建时间
  updatedAt: Date;      // 更新时间
}

// 索引
- email: unique index
```

### 2. Task 模型
```typescript
interface ITask {
  title: string;         // 任务标题
  description?: string;  // 任务描述
  completed: boolean;    // 完成状态
  priority: 'low' | 'medium' | 'high';  // 优先级
  dueDate?: Date;       // 截止日期
  tags: string[];       // 标签
  user: ObjectId;       // 关联用户
  category?: string;    // 分类
  status: 'pending' | 'in_progress' | 'completed' | 'archived';  // 任务状态
  completedAt?: Date;   // 完成时间
  createdAt: Date;      // 创建时间
  updatedAt: Date;      // 更新时间
}

// 索引
- user + status: compound index
- dueDate: sparse index
- tags: multikey index
```

## 组件结构

> 注：此部分将在前端设计完成后补充

### 1. 组件层次
TBD

### 2. 状态管理
TBD

### 3. 路由设计
TBD 