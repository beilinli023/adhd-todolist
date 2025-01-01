import React, { useEffect, useState } from 'react';
import { useTask } from '../../contexts/TaskContext';
import type { Task, TaskStatus, TaskQueryParams } from '../../types/task';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import CreateTask from './CreateTask';
import EditTask from './EditTask';
import SearchBox from './SearchBox';
import DraggableTaskItem from './DraggableTaskItem';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const TaskList: React.FC = () => {
  const {
    tasks = [],
    total = 0,
    page = 1,
    totalPages = 1,
    isLoading,
    error,
    setError,
    setTasks,
    fetchTasks,
    updateTask,
    deleteTask,
    batchUpdateStatus,
    batchDelete,
    updateTasksOrder,
  } = useTask();

  // 状态管理
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskQueryParams>({
    status: undefined,
    priority: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });

  // 获取任务列表
  useEffect(() => {
    fetchTasks(filters);
  }, [fetchTasks, filters]);

  // 处理筛选
  const handleFilterChange = (field: keyof TaskQueryParams, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // 重置页码
    }));
  };

  // 处理分页
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // 状态更新处理
  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTask(taskId, { status });
    } catch (err) {
      // 错误已在 TaskContext 中处理
    }
  };

  // 删除处理
  const handleDelete = async (taskId: string) => {
    console.log('开始删除任务:', taskId);
    if (window.confirm('确定要删除这个任务吗？')) {
      try {
        console.log('用户确认删除，调用 deleteTask');
        await deleteTask(taskId);
        console.log('删除任务成功');
      } catch (err) {
        console.error('删除任务失败:', err);
        // 错误已在 TaskContext 中处理
      }
    } else {
      console.log('用户取消删除');
    }
  };

  // 批量操作处理
  const handleBatchAction = async (action: 'complete' | 'delete') => {
    if (selectedTasks.length === 0) return;
    console.log('开始批量操作:', action, '选中的任务:', selectedTasks);

    if (action === 'complete') {
      try {
        console.log('批量更新任务状态为已完成');
        await batchUpdateStatus(selectedTasks, 'completed');
        setSelectedTasks([]);
        console.log('批量更新状态成功');
      } catch (err) {
        console.error('批量更新状态失败:', err);
        // 错误已在 TaskContext 中处理
      }
    } else if (action === 'delete' && window.confirm('确定要删除选中的任务吗？')) {
      try {
        console.log('批量删除任务');
        await batchDelete(selectedTasks);
        setSelectedTasks([]);
        console.log('批量删除成功');
      } catch (err) {
        console.error('批量删除失败:', err);
        // 错误已在 TaskContext 中处理
      }
    }
  };

  // 任务选择处理
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  // 添加编辑处理函数
  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  // 添加编辑完成处理函数
  const handleEditComplete = () => {
    setEditingTask(null);
  };

  // 添加搜索处理函数
  const handleSearch = (query: string) => {
    // 如果搜索词为空，直接重置筛选条件
    if (!query.trim()) {
      setFilters(prev => ({
        ...prev,
        search: undefined,
        page: 1
      }));
      return;
    }
    
    // 否则更新搜索条件
    setFilters(prev => ({
      ...prev,
      search: query,
      page: 1
    }));
  };

  // 添加拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 处理拖拽结束
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task._id === active.id);
      const newIndex = tasks.findIndex((task) => task._id === over.id);

      // 保存原始任务列表，用于错误回滚
      const originalTasks = [...tasks];

      try {
        // 乐观更新本地状态
        const newTasks = arrayMove(tasks, oldIndex, newIndex);
        
        // 计算新的顺序值
        const updatedTasks = newTasks.map((task, index) => ({
          _id: task._id,
          order: index
        }));

        // 立即更新本地状态
        setTasks(newTasks);

        // 调用后端 API 更新任务顺序
        await updateTasksOrder(updatedTasks);
        console.log('任务顺序已更新:', { oldIndex, newIndex, updatedTasks });

        // 成功后刷新任务列表，确保与服务器同步
        await fetchTasks(filters);
      } catch (error) {
        console.error('更新任务顺序失败:', error);
        // 如果更新失败，回滚到原始状态
        setTasks(originalTasks);
        // 显示错误提示
        setError('更新任务顺序失败，请重试');
        
        // 刷新任务列表以恢复正确的顺序
        await fetchTasks(filters);
      }
    }
  };

  // 加载状态 - 只在初始加载时显示加载动画
  if (isLoading && !filters.search && !tasks.length) {
    return <LoadingSpinner className="my-8" />;
  }

  // 错误状态
  if (error) {
    return <ErrorAlert message={error} />;
  }

  // 空状态 - 只在非搜索状态或搜索完成后显示
  if ((!tasks || tasks.length === 0) && !isLoading) {
    return (
      <div className="space-y-6">
        {/* 搜索和筛选区域 - 即使没有结果也要显示 */}
        <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm">
          {/* 搜索框 */}
          <div className="w-full">
            <SearchBox 
              onSearch={handleSearch}
              placeholder="搜索任务标题、描述或标签..."
              className="w-full"
            />
          </div>

          {/* 筛选和操作栏 */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex gap-3 flex-wrap">
              {/* 状态筛选 */}
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input w-32"
              >
                <option value="">所有状态</option>
                <option value="pending">待处理</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
                <option value="archived">已归档</option>
              </select>

              {/* 优先级筛选 */}
              <select
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="input w-32"
              >
                <option value="">所有优先级</option>
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>

              {/* 排序选择 */}
              <select
                value={`${filters.sortBy}_${filters.sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('_');
                  setFilters(prev => ({ ...prev, sortBy: field, sortOrder: order as 'asc' | 'desc' }));
                }}
                className="input w-40"
              >
                <option value="order_asc">自定义顺序</option>
                <option value="createdAt_desc">创建时间（最新）</option>
                <option value="createdAt_asc">创建时间（最早）</option>
                <option value="dueDate_asc">截止日期（最近）</option>
                <option value="dueDate_desc">截止日期（最远）</option>
                <option value="priority_desc">优先级（高到低）</option>
                <option value="priority_asc">优先级（低到高）</option>
              </select>
            </div>
          </div>
        </div>

        {/* 空状态区域 - 添加最小高度和过渡效果 */}
        <div className="min-h-[400px] transition-all duration-300 ease-in-out">
          <div className="h-full bg-white rounded-lg shadow-sm flex flex-col items-center justify-center">
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {filters.search ? '没有找到匹配的任务' : '暂无任务'}
              </p>
              {(filters.status || filters.priority || filters.search) && (
                <button
                  onClick={() => setFilters({
                    sortBy: 'createdAt',
                    sortOrder: 'desc',
                    page: 1,
                    limit: 10
                  })}
                  className="text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                >
                  清除筛选条件
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 渲染任务列表
  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <ErrorAlert
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* 搜索和筛选区域 */}
      <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm">
        {/* 搜索框 */}
        <div className="w-full">
          <SearchBox 
            onSearch={handleSearch}
            placeholder="搜索任务标题、描述或标签..."
            className="w-full"
          />
        </div>

        {/* 筛选和操作栏 */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-3 flex-wrap">
            {/* 状态筛选 */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input w-32"
            >
              <option value="">所有状态</option>
              <option value="pending">待处理</option>
              <option value="in_progress">进行中</option>
              <option value="completed">已完成</option>
              <option value="archived">已归档</option>
            </select>

            {/* 优先级筛选 */}
            <select
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="input w-32"
            >
              <option value="">所有优先级</option>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>

            {/* 排序选择 */}
            <select
              value={`${filters.sortBy}_${filters.sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('_');
                setFilters(prev => ({ ...prev, sortBy: field, sortOrder: order as 'asc' | 'desc' }));
              }}
              className="input w-40"
            >
              <option value="order_asc">自定义顺序</option>
              <option value="createdAt_desc">创建时间（最新）</option>
              <option value="createdAt_asc">创建时间（最早）</option>
              <option value="dueDate_asc">截止日期（最近）</option>
              <option value="dueDate_desc">截止日期（最远）</option>
              <option value="priority_desc">优先级（高到低）</option>
              <option value="priority_asc">优先级（低到高）</option>
            </select>
          </div>

          {/* 创建任务按钮 */}
          <div className="flex items-center gap-3">
            <CreateTask />
            {/* 批量操作按钮 */}
            {selectedTasks.length > 0 && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* 任务列表区域 - 添加最小高度和过渡效果 */}
      <div className="min-h-[400px] transition-all duration-300 ease-in-out">
        {/* 任务列表 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tasks.map(task => task._id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <li key={task._id}>
                    <DraggableTaskItem
                      task={task}
                      onStatusChange={handleStatusChange}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onSelect={toggleTaskSelection}
                      isSelected={selectedTasks.includes(task._id)}
                    />
                  </li>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </div>

        {/* 分页控件 */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`px-3 py-1 rounded ${
                page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              上一页
            </button>
            <span className="px-3 py-1 text-gray-700">
              第 {page} 页，共 {totalPages} 页（总计 {total} 个任务）
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded ${
                page === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              下一页
            </button>
          </div>
        )}
      </div>

      {/* 编辑任务对话框 */}
      {editingTask && (
        <EditTask
          task={editingTask}
          onClose={handleEditComplete}
        />
      )}
    </div>
  );
};

export default TaskList; 