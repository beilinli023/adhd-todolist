import React, { useState } from 'react';
import { createTestTasks } from '../utils/createTestTasks';

const TestDataGenerator: React.FC = () => {
  const [count, setCount] = useState<number>(20);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<string>('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setMessage('开始生成测试数据...');
    
    try {
      await createTestTasks(count);
      setMessage('测试数据生成成功！');
    } catch (error) {
      setMessage(`生成测试数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">测试数据生成器</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            生成任务数量
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={count}
            onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {isGenerating ? '生成中...' : '生成测试数据'}
        </button>

        {message && (
          <div className={`mt-4 p-4 rounded-md ${
            message.includes('失败') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestDataGenerator; 