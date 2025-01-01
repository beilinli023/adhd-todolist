import { z } from 'zod';

// 基础验证规则
const titleSchema = z
  .string()
  .min(1, '标题不能为空')
  .max(200, '标题不能超过200个字符')
  .trim();

const descriptionSchema = z
  .string()
  .max(1000, '描述不能超过1000个字符')
  .trim()
  .optional();

const prioritySchema = z.enum(['low', 'medium', 'high']);

const dueDateSchema = z
  .string()
  .datetime({ message: '请提供有效的日期时间格式' })
  .refine((date) => new Date(date) > new Date(), '截止日期必须是将来的时间')
  .optional();

const tagsSchema = z
  .array(z.string().trim().min(1, '标签不能为空'))
  .max(10, '标签不能超过10个')
  .optional();

const categorySchema = z
  .string()
  .max(50, '分类不能超过50个字符')
  .trim()
  .optional();

const statusSchema = z.enum(['pending', 'in_progress', 'completed', 'archived']);

// 创建任务验证 Schema
export const createTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  priority: prioritySchema,
  dueDate: dueDateSchema,
  tags: tagsSchema,
  category: categorySchema,
});

// 更新任务验证 Schema
export const updateTaskSchema = createTaskSchema.partial();

// 更新任务状态验证 Schema
export const updateTaskStatusSchema = z.object({
  status: statusSchema,
});

// 批量更新任务状态验证 Schema
export const batchUpdateTaskStatusSchema = z.object({
  ids: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, '无效的任务ID')),
  status: statusSchema,
});

// 批量删除任务验证 Schema
export const batchDeleteTasksSchema = z.object({
  ids: z.array(z.string()).min(1, '至少需要提供一个任务ID'),
});

// 任务查询参数验证 Schema
export const taskQuerySchema = z.object({
  status: statusSchema.optional(),
  priority: prioritySchema.optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.union([z.number(), z.string()]).transform(val => Number(val)).pipe(z.number().int().min(1)).optional().default(1),
  limit: z.union([z.number(), z.string()]).transform(val => Number(val)).pipe(z.number().int().min(1).max(50)).optional().default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
}); 