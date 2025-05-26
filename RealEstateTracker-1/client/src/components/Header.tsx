import { Bell, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { FoodItem } from "@shared/schema";
import { useLocalStorage } from "../hooks/use-local-storage";

interface HeaderProps {
  onResetFridge?: () => void;
}

const Header = ({ onResetFridge }: HeaderProps) => {
  const { data: expiringItems } = useQuery<FoodItem[]>({
    queryKey: ['/api/food-items/expiring/0'], // Get items expiring today
  });
  const [fridgeName] = useLocalStorage("fridgeName", "我的智能冰箱");

  const hasNotifications = expiringItems && expiringItems.length > 0;

  return (
    <header className="bg-white shadow-sm animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-blue-100 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-primary relative z-10 transform group-hover:scale-110 transition-transform duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" 
              />
            </svg>
          </div>
          <div className="transform group-hover:translate-x-1 transition-transform duration-300">
            <h1 className="text-xl font-semibold gradient-text">智能冰箱管理</h1>
            <p className="text-sm text-gray-500 transition-all duration-300 group-hover:text-blue-500">{fridgeName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={onResetFridge}
            className="relative p-2 rounded-full text-gray-500 hover:text-primary hover:bg-blue-50 transition-all duration-300 focus:outline-none"
            title="重新設定冰箱名稱"
          >
            <Settings className="h-6 w-6" />
          </button>
          <button className="relative p-2 rounded-full text-gray-500 hover:text-primary hover:bg-blue-50 transition-all duration-300 focus:outline-none">
            <Bell className="h-6 w-6" />
            {hasNotifications && (
              <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-danger animate-pulse border-2 border-white"></span>
            )}
          </button>
          <div className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 transition-all duration-300">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-sm font-medium text-white shadow-sm transition-transform duration-300 hover:scale-105">
              U
            </div>
            <span className="text-sm font-medium text-gray-700">用戶</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
