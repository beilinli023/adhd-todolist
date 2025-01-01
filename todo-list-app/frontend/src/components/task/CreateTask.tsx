import React, { useState } from 'react';
import { useTask } from '../../contexts/TaskContext';
import type { CreateTaskDTO } from '../../types/task';
import ErrorAlert from '../common/ErrorAlert';
import LoadingSpinner from '../common/LoadingSpinner';

const CreateTask: React.FC = () => {
  const { createTask, error, isLoading } = useTask();
  const [isOpen, setIsOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateTaskDTO>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    tags: [],
    category: '',
  });
  const [tagInput, setTagInput] = useState('');

  const validateForm = () => {
    if (!formData.title.trim()) {
      setFormError('标题不能为空');
      return false;
    }
    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      setFormError('截止日期不能早于当前时间');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await createTask(formData);
      setIsOpen(false);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        tags: [],
        category: '',
      });
      setFormError(null);
    } catch (err: any) {
      setFormError(err.message || '创建任务失败，请重试');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 清除之前的错误
    setFormError(null);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (formData.tags && formData.tags.length >= 10) {
        setFormError('最多只能添加10个标签');
        return;
      }
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
      setFormError(null);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove),
    }));
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn">
        创建新任务
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">创建新任务</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">关闭</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {(error || formError) && <ErrorAlert message={formError || error} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="label">
              标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="input mt-1"
              placeholder="请输入任务标题"
            />
          </div>

          <div>
            <label htmlFor="description" className="label">
              描述
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input mt-1"
              rows={3}
              placeholder="请输入任务描述（选填）"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="label">
                优先级
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input mt-1"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>

            <div>
              <label htmlFor="dueDate" className="label">
                截止日期
              </label>
              <input
                type="datetime-local"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="input mt-1"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="label">
              分类
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input mt-1"
              placeholder="请输入任务分类（选填）"
            />
          </div>

          <div>
            <label htmlFor="tags" className="label">
              标签（按回车添加，最多10个）
            </label>
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="input mt-1"
              placeholder="输入标签并按回车（选填）"
              disabled={formData.tags && formData.tags.length >= 10}
            />
            {formData.tags && formData.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 inline-flex items-center p-0.5 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
                    >
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-secondary"
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  创建中...
                </span>
              ) : '创建任务'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask; 