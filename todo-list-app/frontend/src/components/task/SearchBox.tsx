import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  onSearch,
  placeholder = '搜索任务...',
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // 使用 useCallback 和 debounce 优化搜索性能
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setIsTyping(false);
      onSearch(query);
    }, 500),
    [onSearch]
  );

  // 清理防抖函数
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsTyping(true);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setSearchTerm('');
    setIsTyping(false);
    onSearch('');
  };

  return (
    <div className={`relative group ${className}`}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-12 py-2.5 border-2 rounded-lg 
          transition-all duration-300 ease-in-out
          ${isFocused 
            ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-lg' 
            : 'border-gray-200 hover:border-gray-300'
          }
          focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
          placeholder-gray-400 hover:placeholder-gray-500`}
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className={`h-5 w-5 transition-colors duration-200 ease-in-out
            ${isFocused ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      {searchTerm && (
        <button
          onClick={handleClear}
          className={`absolute inset-y-0 right-0 pr-3 flex items-center
            transition-all duration-200 ease-in-out
            hover:bg-gray-100 active:bg-gray-200
            rounded-r-lg px-3 mr-[-1px]
            group/clear`}
          title="清除搜索"
        >
          <span className="sr-only">清除搜索</span>
          <div className="relative">
            <svg
              className="h-5 w-5 text-gray-400 group-hover/clear:text-gray-600 
                transition-all duration-200 ease-in-out
                group-hover/clear:scale-110 group-active/clear:scale-95"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span className="absolute top-[-24px] left-1/2 transform -translate-x-1/2
              bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0
              group-hover/clear:opacity-100 transition-opacity duration-200
              whitespace-nowrap pointer-events-none">
              清除搜索
            </span>
          </div>
        </button>
      )}
      {isTyping && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-white rounded-lg shadow-lg text-sm text-gray-500 text-center">
          输入完成后将自动搜索...
        </div>
      )}
    </div>
  );
};

export default SearchBox; 