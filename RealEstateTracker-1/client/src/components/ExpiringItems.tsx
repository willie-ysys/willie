import { useQuery } from "@tanstack/react-query";
import { FoodItem } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import ExpiringItemsModal from "./modals/ExpiringItemsModal";

const ExpiringItems = () => {
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading } = useQuery<FoodItem[]>({
    queryKey: ['/api/food-items/expiring/3', { fridgeAccountId: 1 }], // Get items expiring in the next 3 days
  });

  const getExpiryText = (expiryDate: Date) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Expires today";
    if (diffDays === 1) return "Expires tomorrow";
    return `Expires in ${diffDays} days`;
  };

  const getExpiryClass = (expiryDate: Date) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0 || diffDays === 0) return "text-danger bg-red-50 border-danger";
    if (diffDays <= 3) return "text-warning bg-yellow-50 border-warning";
    return "text-secondary bg-green-50 border-secondary";
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 card-hover animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold gradient-text">即將到期</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="text-sm text-primary hover:underline transition-colors duration-300 hover:scale-105"
        >
          查看全部
        </button>
      </div>
      <div className="space-y-3">
        {data && data.length > 0 ? (
          data.slice(0, 3).map((item, index) => (
            <div 
              key={item.id} 
              className={`flex items-center p-3 rounded-lg border-l-4 ${getExpiryClass(new Date(item.expiryDate))} 
                transition-all duration-300 hover:translate-x-1 animate-slide-up`}
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                <p className={`text-xs ${getExpiryClass(new Date(item.expiryDate)).split(' ')[0]} flex items-center`}>
                  <span className="inline-block w-2 h-2 rounded-full bg-current mr-1"></span>
                  {getExpiryText(new Date(item.expiryDate))}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-colors duration-300 ${
                  item.compartment.includes("Crisper") 
                    ? "bg-green-100 text-green-800 hover:bg-green-200" 
                    : item.compartment.includes("Shelf") 
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                }`}>
                  {item.compartment}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 animate-fade-in">
            <div className="inline-block p-3 rounded-full bg-blue-50 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">目前沒有即將到期的食品</p>
            <p className="text-xs text-gray-400 mt-1">添加食品後會在此顯示到期提醒</p>
          </div>
        )}
      </div>
      
      {/* 即將到期食品詳細模態框 */}
      {showModal && (
        <ExpiringItemsModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default ExpiringItems;
