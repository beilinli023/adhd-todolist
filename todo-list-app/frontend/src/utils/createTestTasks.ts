import * as taskService from '../services/task';
import type { CreateTaskDTO, TaskPriority } from '../types/task';

const priorities: TaskPriority[] = ['high', 'medium', 'low'];
const tags = ['工作', '学习', '生活', '娱乐', '运动', '阅读', '写作', '编程'];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomTags(): string[] {
  const numTags = Math.floor(Math.random() * 3) + 1; // 1-3个标签
  const selectedTags: string[] = [];
  for (let i = 0; i < numTags; i++) {
    const tag = getRandomElement(tags);
    if (!selectedTags.includes(tag)) {
      selectedTags.push(tag);
    }
  }
  return selectedTags;
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export async function createTestTasks(count: number = 20): Promise<void> {
  console.log(`开始创建 ${count} 个测试任务...`);
  
  const now = new Date();
  const oneMonthLater = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  
  try {
    for (let i = 1; i <= count; i++) {
      const priority = getRandomElement(priorities);
      const dueDate = getRandomDate(now, oneMonthLater);
      
      const taskData: CreateTaskDTO = {
        title: `测试任务 ${i} - ${priority} 优先级`,
        description: `这是一个${priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}优先级的测试任务，用于测试任务列表的显示和功能。`,
        priority,
        dueDate: dueDate.toISOString(),
        tags: getRandomTags(),
      };

      await taskService.createTask(taskData);
      console.log(`已创建任务 ${i}/${count}`);
    }
    
    console.log('所有测试任务创建完成！');
  } catch (error) {
    console.error('创建测试任务失败:', error);
    throw error;
  }
} 