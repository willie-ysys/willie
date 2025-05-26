import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Calendar, MapPin, Search, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FoodItem } from "@shared/schema";

interface AllItemsModalProps {
  onClose: () => void;
  onEdit?: (item: FoodItem) => void;
}

const AllItemsModal: React.FC<AllItemsModalProps> = ({ onClose, onEdit }) => {
  const [open, setOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCompartment, setFilterCompartment] = useState("all");
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: foodItems = [], isLoading } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  // 刪除食品項目
  const deleteFoodMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/food-items/${id}`, {});
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/food-items/expiring/5"] });
      toast({
        title: "刪除成功",
        description: "食品項目已成功刪除",
      });
    },
    onError: () => {
      toast({
        title: "刪除失敗",
        description: "刪除食品項目時發生錯誤",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item);
    handleClose(); // 關閉當前模態框
    // 觸發父組件開啟編輯模態框
    onEdit?.(item);
  };

  const handleDelete = (id: number) => {
    if (confirm("確定要刪除這個食品項目嗎？")) {
      deleteFoodMutation.mutate(id);
    }
  };

  // 過濾食品
  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesCompartment = filterCompartment === "all" || item.compartment === filterCompartment;
    return matchesSearch && matchesCategory && matchesCompartment;
  });

  // 獲取所有類別
  const categories = Array.from(new Set(foodItems.map(item => item.category)));
  const compartments = Array.from(new Set(foodItems.map(item => item.compartment)));

  // 獲取到期狀態
  // 獲取食品類別顏色
  const getCategoryColor = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      '蔬菜': 'bg-green-100 text-green-800 border-green-200',
      '水果': 'bg-red-100 text-red-800 border-red-200',
      '肉類': 'bg-pink-100 text-pink-800 border-pink-200',
      '海鮮': 'bg-blue-100 text-blue-800 border-blue-200',
      '乳製品': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      '冷凍食品': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      '麵包糕點': 'bg-orange-100 text-orange-800 border-orange-200',
      '調味料': 'bg-purple-100 text-purple-800 border-purple-200',
      '飲料': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      '其他': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return categoryColors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { text: "已過期", class: "bg-red-100 text-red-800", days: daysUntilExpiry };
    } else if (daysUntilExpiry === 0) {
      return { text: "今日到期", class: "bg-orange-100 text-orange-800", days: daysUntilExpiry };
    } else if (daysUntilExpiry <= 3) {
      return { text: `${daysUntilExpiry}天內到期`, class: "bg-yellow-100 text-yellow-800", days: daysUntilExpiry };
    } else if (daysUntilExpiry <= 7) {
      return { text: `${daysUntilExpiry}天內到期`, class: "bg-blue-100 text-blue-800", days: daysUntilExpiry };
    } else {
      return { text: `${daysUntilExpiry}天後到期`, class: "bg-green-100 text-green-800", days: daysUntilExpiry };
    }
  };

  // 按到期日期排序
  const sortedItems = [...filteredItems].sort((a, b) => {
    const statusA = getExpiryStatus(a.expiryDate);
    const statusB = getExpiryStatus(b.expiryDate);
    return statusA.days - statusB.days;
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            所有食品 ({foodItems.length} 項)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 搜尋和篩選區域 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜尋食品名稱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="選擇類別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有類別</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCompartment} onValueChange={setFilterCompartment}>
              <SelectTrigger>
                <SelectValue placeholder="選擇位置" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有位置</SelectItem>
                {compartments.map(compartment => (
                  <SelectItem key={compartment} value={compartment}>{compartment}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 食品列表 */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <p>載入中...</p>
              </div>
            )}

            {!isLoading && sortedItems.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">沒有找到符合條件的食品</h3>
                <p className="text-gray-600">請調整搜尋條件或添加更多食品</p>
              </div>
            )}

            {!isLoading && sortedItems.length > 0 && (
              <div className="grid gap-3">
                {sortedItems.map((item) => {
                  const expiryStatus = getExpiryStatus(item.expiryDate);
                  return (
                    <Card key={item.id} className={`hover:shadow-md transition-shadow ${getCategoryColor(item.category)}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-lg">{item.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {item.compartment}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(item.expiryDate).toLocaleDateString('zh-TW')}
                              </div>
                              <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                            </div>

                          </div>
                          
                          <div className="ml-4 flex items-center gap-2">
                            <Badge className={expiryStatus.class}>
                              {expiryStatus.text}
                            </Badge>
                            
                            {/* 編輯和刪除按鈕 */}
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                                className="h-8 w-8 p-0 hover:bg-blue-100"
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                className="h-8 w-8 p-0 hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* 統計資訊 */}
          {!isLoading && filteredItems.length > 0 && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                <div>
                  <div className="font-semibold text-lg">{filteredItems.length}</div>
                  <div className="text-gray-600">顯示項目</div>
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    {filteredItems.filter(item => getExpiryStatus(item.expiryDate).days <= 3).length}
                  </div>
                  <div className="text-gray-600">即將到期</div>
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    {new Set(filteredItems.map(item => item.category)).size}
                  </div>
                  <div className="text-gray-600">食品類別</div>
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    {new Set(filteredItems.map(item => item.compartment)).size}
                  </div>
                  <div className="text-gray-600">儲存位置</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={handleClose}>
            關閉
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AllItemsModal;