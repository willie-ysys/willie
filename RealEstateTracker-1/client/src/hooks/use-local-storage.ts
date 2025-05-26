import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // 獲取初始值函數，只會在組件首次渲染時執行一次
  const readValue = (): T => {
    // 檢查是否在客戶端環境
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // 嘗試從本地存儲獲取值
      const item = window.localStorage.getItem(key);
      // 如果值存在則解析 JSON，否則返回初始值
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // 使用 useState 來追蹤狀態值
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 返回一個包裝後的設置函數
  const setValue = (value: T) => {
    // 檢查是否在客戶端環境
    if (typeof window === 'undefined') {
      console.warn(`Tried setting localStorage key "${key}" even though environment is not a client`);
    }

    try {
      // 允許值可以是一個函數，類似於 useState 的形式
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // 保存到狀態
      setStoredValue(valueToStore);
      // 保存到本地存儲
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // 監聽存儲事件，當其他頁面或 iframe 更改了此鍵的值時更新
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue));
      }
    };

    // 添加事件監聽器
    window.addEventListener('storage', handleStorageChange);

    // 移除事件監聽器
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}