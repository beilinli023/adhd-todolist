import React, { useEffect, useState } from 'react';
import { useTask } from '../../contexts/TaskContext';
// Task类型被useTask hook返回的tasks数组隐式使用
// TaskStatus用于状态筛选和更新操作的类型检查
import type { Task, TaskStatus } from '../../types/task';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';

const TaskList: React.FC = () => {
  const {
    tasks = [],
    total = 0,
    page = 1,
    totalPages = 1,
    isLoading,
    error,
    fetchTasks,
    updateTask,
    deleteTask,
    batchUpdateStatus,
    batchDelete,
  } = useTask();

  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');

  useEffect(() => {
    fetchTasks(statusFilter ? { status: statusFilter } : {});
  }, [fetchTasks, statusFilter]);

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTask(taskId, { status });
    } catch (err) {
      // 错误已在 TaskContext 中处理
    }
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      try {
        await deleteTask(taskId);
      } catch (err) {
        // 错误已在 TaskContext 中处理
      }
    }
  };

  const handleBatchAction = async (action: 'complete' | 'delete') => {
    if (selectedTasks.length === 0) return;

    if (action === 'complete') {
      try {
        await batchUpdateStatus(selectedTasks, 'completed');
        setSelectedTasks([]);
      } catch (err) {
        // 错误已在 TaskContext 中处理
      }
    } else if (action === 'delete' && window.confirm('确定要删除选中的任务吗？')) {
      try {
        await batchDelete(selectedTasks);
        setSelectedTasks([]);
      } catch (err) {
        // 错误已在 TaskContext 中处理
      }
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  if (isLoading) {
    return <LoadingSpinner className="my-8" />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">暂无任务</p>
        {statusFilter && (
          <button
            onClick={() => setStatusFilter('')}
            className="mt-4 text-indigo-600 hover:text-indigo-500"
          >
            查看所有任务
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
          className="input"
        >
          <option value="">所有状态</option>
          <option value="pending">待处理</option>
          <option value="in_progress">进行中</option>
          <option value="completed">已完成</option>
          <option value="archived">已归档</option>
        </select>

        {selectedTasks.length > 0 && (
          <div className="space-x-2">
            <button
              onClick={() => handleBatchAction('complete')}
              className="btn-secondary"
            >
              标记完成
            </button>
            <button
              onClick={() => handleBatchAction('delete')}
              className="btn-secondary text-red-600 hover:text-red-700"
            >
              删除所选
            </button>
          </div>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {tasks.map((task) => (
            <li key={task.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => toggleTaskSelection(task.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                      {task.description && (
                        <p className="mt-1 text-sm text-gray-500">{task.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className="text-sm border-gray-300 rounded-md"
                    >
                      <option value="pending">待处理</option>
                      <option value="in_progress">进行中</option>
                      <option value="completed">已完成</option>
                      <option value="archived">已归档</option>
                    </select>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      删除
                    </button>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      优先级：{task.priority}
                    </p>
                    {task.dueDate && (
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        截止日期：{new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {task.tags && task.tags.length > 0 && (
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <span className="mr-2">标签：</span>
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {total > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-700">
            共 {total} 个任务，第 {page} 页，共 {totalPages} 页
          </p>
          <div className="space-x-2">
            <button
              onClick={() => fetchTasks({ page: page - 1 })}
              disabled={page === 1}
              className="btn-secondary"
            >
              上一页
            </button>
            <button
              onClick={() => fetchTasks({ page: page + 1 })}
              disabled={page === totalPages}
              className="btn-secondary"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList; 