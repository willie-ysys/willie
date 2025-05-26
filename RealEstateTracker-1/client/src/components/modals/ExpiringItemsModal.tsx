import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { FoodItem } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Clock, MapPin } from "lucide-react";
import { useState } from "react";

interface ExpiringItemsModalProps {
  onClose: () => void;
}

const ExpiringItemsModal: React.FC<ExpiringItemsModalProps> = ({ onClose }) => {
  const [open, setOpen] = useState(true);

  // 獲取即將到期的食品（3天內）
  const { data, isLoading } = useQuery<FoodItem[]>({
    queryKey: ['/api/food-items/expiring/3'],
  });

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const getExpiryText = (expiryDate: Date) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "已過期";
    if (diffDays === 0) return "今天到期";
    if (diffDays === 1) return "明天到期";
    return `${diffDays} 天後到期`;
  };

  const getExpiryClass = (expiryDate: Date) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "bg-red-100 text-red-800 border-red-200";
    if (diffDays === 0) return "bg-red-100 text-red-800 border-red-200";
    if (diffDays <= 3) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (diffDays <= 7) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getUrgencyIcon = (expiryDate: Date) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "🚨";
    if (diffDays <= 3) return "⚠️";
    if (diffDays <= 7) return "⏰";
    return "📅";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold gradient-text flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            即將到期的食品
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-1/3 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : data && data.length > 0 ? (
            <div className="space-y-3">
              {data.map((item, index) => (
                <div 
                  key={item.id}
                  className={`p-4 rounded-lg border-l-4 transition-all duration-300 hover:shadow-md hover:scale-[1.01] animate-slide-up ${getExpiryClass(new Date(item.expiryDate))}`}
                  style={{ animationDelay: `${0.05 * (index + 1)}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-2">
                        <span className="text-lg mr-2">{getUrgencyIcon(new Date(item.expiryDate))}</span>
                        <h3 className="text-lg font-medium text-gray-900 truncate">{item.name}</h3>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {getExpiryText(new Date(item.expiryDate))}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {item.compartment}
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium text-gray-500">
                        到期日期
                      </div>
                      <div className="text-lg font-semibold">
                        {new Date(item.expiryDate).toLocaleDateString('zh-TW')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 animate-fade-in">
              <div className="inline-block p-4 rounded-full bg-blue-50 mb-4">
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">沒有即將到期的食品</h3>
              <p className="text-sm text-gray-500">所有食品都還很新鮮！</p>
            </div>
          )}
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>顯示 3 天內即將到期的食品</span>
            <Button onClick={handleClose} className="bg-primary hover:bg-primary-hover">
              關閉
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpiringItemsModal;