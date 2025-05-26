import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FoodItem } from "@shared/schema";
import { useState } from "react";
import { Edit2, Trash2, Clock, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface CompartmentModalProps {
  compartmentName: string;
  items: FoodItem[];
  onClose: () => void;
  onAddItem: () => void;
}

const CompartmentModal: React.FC<CompartmentModalProps> = ({
  compartmentName,
  items,
  onClose,
  onAddItem,
}) => {
  const [open, setOpen] = useState(true);
  const { toast } = useToast();

  // 中文翻譯
  const translations = {
    title: "夾層內容",
    description: "管理此夾層中的所有食品",
    items: "食品",
    addItem: "添加食品",
    emptyState: "此夾層中沒有食品",
    successTitle: "刪除成功",
    successDescription: "食品已成功從冰箱中移除",
    errorTitle: "錯誤",
    errorDescription: "刪除食品失敗，請重試"
  };

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/food-items/${id}`);
      toast({
        title: translations.successTitle,
        description: translations.successDescription,
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/food-items/compartment'] });
      queryClient.invalidateQueries({ queryKey: ['/api/food-items/expiring'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    } catch (error) {
      toast({
        title: translations.errorTitle,
        description: translations.errorDescription,
        variant: "destructive",
      });
    }
  };

  const getExpiryStyle = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "text-danger";
    if (diffDays <= 3) return "text-warning";
    return "text-secondary";
  };

  const formatExpiryDate = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Expires today";
    if (diffDays === 1) return "Expires tomorrow";
    return `Expires in ${diffDays} days`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{translations.title}: {compartmentName}</DialogTitle>
          <DialogDescription>{translations.description}</DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-700">{translations.items} ({items.length})</h4>
            <Button variant="ghost" size="sm" onClick={onAddItem} className="text-primary">
              <PlusCircle className="h-4 w-4 mr-1" />
              {translations.addItem}
            </Button>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto pb-2">
            {items.length > 0 ? (
              items.map(item => (
                <div key={item.id} className="flex items-center p-3 bg-white border rounded-lg shadow-sm hover:bg-gray-50">
                  {/* 使用食品類別的第一個字作為圖標 */}
                  <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center mr-3">
                    {item.category.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <div className="flex items-center">
                      <Clock className={`h-4 w-4 ${getExpiryStyle(item.expiryDate)} mr-1`} />
                      <p className={`text-xs ${getExpiryStyle(item.expiryDate)}`}>
                        {formatExpiryDate(item.expiryDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-gray-500" title="編輯">
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button 
                      className="text-gray-400 hover:text-danger"
                      onClick={() => handleDeleteItem(item.id)}
                      title="刪除"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-gray-500">{translations.emptyState}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompartmentModal;
