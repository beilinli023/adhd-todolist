# ADHD ToDo List API 文档

## 基础信息

- 基础URL: `http://localhost:3000/api`
- 所有请求和响应均使用 JSON 格式
- 认证使用 Bearer Token 方式

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {
    // 响应数据
  }
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误信息"
  }
}
```

## 认证 API

### 注册用户
- **POST** `/auth/register`
- **描述**：创建新用户账户

**请求体**：
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "用户名"
}
```

**响应** (201 Created)：
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "用户名",
    "token": "jwt_token"
  }
}
```

### 用户登录
- **POST** `/auth/login`
- **描述**：用户登录并获取认证令牌

**请求体**：
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**响应** (200 OK)：
```json
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "用户名"
    }
  }
}
```

### 获取当前用户信息
- **GET** `/auth/me`
- **描述**：获取当前登录用户信息
- **需要认证**：是

**响应** (200 OK)：
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "用户名"
  }
}
```

## 任务管理 API

### 创建任务
- **POST** `/tasks`
- **描述**：创建新任务
- **需要认证**：是

**请求体**：
```json
{
  "title": "任务标题",
  "description": "任务描述",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59Z",
  "tags": ["工作", "重要"],
  "category": "工作"
}
```

**响应** (201 Created)：
```json
{
  "success": true,
  "data": {
    "id": "task_id",
    "title": "任务标题",
    "description": "任务描述",
    "priority": "high",
    "status": "pending",
    "dueDate": "2024-12-31T23:59:59Z",
    "tags": ["工作", "重要"],
    "category": "工作",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 获取任务列表
- **GET** `/tasks`
- **描述**：获取任务列表，支持过滤、排序和分页
- **需要认证**：是

**查询参数**：
- `status`: 任务状态 (pending/in_progress/completed/archived)
- `priority`: 优先级 (low/medium/high)
- `search`: 搜索关键词
- `category`: 分类
- `tags`: 标签（可多选）
- `startDate`: 开始日期
- `endDate`: 结束日期
- `page`: 页码（默认：1）
- `limit`: 每页数量（默认：20，最大：50）
- `sortBy`: 排序字段
- `sortOrder`: 排序方向 (asc/desc)

**响应** (200 OK)：
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task_id",
        "title": "任务标题",
        "description": "任务描述",
        "priority": "high",
        "status": "pending",
        "dueDate": "2024-12-31T23:59:59Z",
        "tags": ["工作", "重要"],
        "category": "工作",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "totalPages": 5
  }
}
```

### 获取单个任务
- **GET** `/tasks/:id`
- **描述**：获取指定任务的详细信息
- **需要认证**：是

**响应** (200 OK)：
```json
{
  "success": true,
  "data": {
    "id": "task_id",
    "title": "任务标题",
    "description": "任务描述",
    "priority": "high",
    "status": "pending",
    "dueDate": "2024-12-31T23:59:59Z",
    "tags": ["工作", "重要"],
    "category": "工作",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 更新任务
- **PUT** `/tasks/:id`
- **描述**：更新指定任务的信息
- **需要认证**：是

**请求体**：
```json
{
  "title": "更新后的标题",
  "description": "更新后的描述",
  "priority": "medium",
  "status": "in_progress",
  "dueDate": "2024-12-31T23:59:59Z",
  "tags": ["工作", "重要"],
  "category": "工作"
}
```

**响应** (200 OK)：
```json
{
  "success": true,
  "data": {
    "id": "task_id",
    "title": "更新后的标题",
    "description": "更新后的描述",
    "priority": "medium",
    "status": "in_progress",
    "dueDate": "2024-12-31T23:59:59Z",
    "tags": ["工作", "重要"],
    "category": "工作",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 删除任务
- **DELETE** `/tasks/:id`
- **描述**：删除指定任务
- **需要认证**：是

**响应** (200 OK)：
```json
{
  "success": true,
  "data": null
}
```

### 批量操作
- **POST** `/tasks/batch`
- **描述**：批量更新或删除任务
- **需要认证**：是

**请求体（批量更新状态）**：
```json
{
  "taskIds": ["task_id1", "task_id2"],
  "action": "update_status",
  "data": {
    "status": "completed"
  }
}
```

**请求体（批量删除）**：
```json
{
  "taskIds": ["task_id1", "task_id2"],
  "action": "delete"
}
```

**响应（批量更新）** (200 OK)：
```json
{
  "success": true,
  "data": {
    "modifiedCount": 2
  }
}
```

**响应（批量删除）** (200 OK)：
```json
{
  "success": true,
  "data": {
    "deletedCount": 2
  }
}
```

## 错误代码说明

- `VALIDATION_ERROR`: 输入数据验证失败
- `UNAUTHORIZED`: 未认证或认证已过期
- `FORBIDDEN`: 无权限访问
- `NOT_FOUND`: 资源不存在
- `INVALID_ID`: 无效的ID格式
- `DUPLICATE_EMAIL`: 邮箱已被注册
- `INVALID_CREDENTIALS`: 登录凭证无效
