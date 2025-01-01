import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TaskProvider } from '../contexts/TaskContext';
import TaskList from '../components/task/TaskList';
import CreateTask from '../components/task/CreateTask';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <TaskProvider>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">ADHD ToDo List</h1>
              </div>
              <div className="flex items-center">
                <span className="text-gray-700 mr-4">欢迎，{user?.name}</span>
                <button
                  onClick={logout}
                  className="btn-secondary"
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">我的任务</h2>
              <CreateTask />
            </div>
            <TaskList />
          </div>
        </main>
      </div>
    </TaskProvider>
  );
};

export default Dashboard; 