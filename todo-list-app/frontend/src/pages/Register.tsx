import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ErrorAlert from '../components/common/ErrorAlert';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  // 字段验证状态
  const [validation, setValidation] = useState({
    email: { isValid: true, message: '' },
    password: { isValid: true, message: '' },
    name: { isValid: true, message: '' }
  });

  // 验证邮箱格式
  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  // 实时验证
  useEffect(() => {
    // 邮箱验证
    if (formData.email) {
      setValidation(prev => ({
        ...prev,
        email: {
          isValid: validateEmail(formData.email),
          message: validateEmail(formData.email) ? '' : '请输入有效的邮箱地址'
        }
      }));
    }

    // 密码验证
    if (formData.password) {
      setValidation(prev => ({
        ...prev,
        password: {
          isValid: formData.password.length >= 6,
          message: formData.password.length >= 6 ? '' : '密码长度至少为6位'
        }
      }));
    }

    // 姓名验证
    if (formData.name) {
      setValidation(prev => ({
        ...prev,
        name: {
          isValid: formData.name.trim().length > 0,
          message: formData.name.trim().length > 0 ? '' : '请输入姓名'
        }
      }));
    }
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 表单验证
    if (!formData.email || !validateEmail(formData.email)) {
      return setError('请输入有效的邮箱地址，例如：user@example.com');
    }

    if (!formData.password || formData.password.length < 6) {
      return setError('密码长度至少为6位');
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('两次输入的密码不一致');
    }

    if (!formData.name.trim()) {
      return setError('请输入姓名');
    }

    try {
      console.log('准备发送的注册数据:', {
        email: formData.email,
        name: formData.name,
        passwordLength: formData.password.length
      });
      
      setIsLoading(true);
      await register(formData.email, formData.password, formData.name);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('注册失败:', err);
      setError(err.message || '注册失败，请检查输入信息是否正确');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">注册账户</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          请按顺序填写以下信息
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && <ErrorAlert message={error} className="mb-4" />}

          <div className="mb-4 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-800">填写说明</h3>
            <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
              <li>邮箱地址：必须是有效的邮箱格式，如 user@example.com</li>
              <li>密码：至少6位字符</li>
              <li>姓名：您的真实姓名或昵称</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                邮箱地址 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="例如：user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`input ${!validation.email.isValid && formData.email ? 'border-red-500' : ''}`}
                />
              </div>
              {!validation.email.isValid && formData.email && (
                <p className="mt-1 text-sm text-red-600">{validation.email.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">此邮箱将用于登录和找回密码</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="请输入至少6位密码"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className={`input ${!validation.password.isValid && formData.password ? 'border-red-500' : ''}`}
                />
              </div>
              {!validation.password.isValid && formData.password && (
                <p className="mt-1 text-sm text-red-600">{validation.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                确认密码 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="请再次输入密码"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={`input ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword 
                      ? 'border-red-500' 
                      : ''
                  }`}
                />
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">两次输入的密码不一致</p>
              )}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                姓名 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="请输入您的姓名或昵称"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`input ${!validation.name.isValid && formData.name ? 'border-red-500' : ''}`}
                />
              </div>
              {!validation.name.isValid && formData.name && (
                <p className="mt-1 text-sm text-red-600">{validation.name.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn w-full"
              >
                {isLoading ? '注册中...' : '注册'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-sm text-center">
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                已有账户？立即登录
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 