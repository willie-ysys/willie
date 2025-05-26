import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { CheckCircle, XCircle, Check, Edit3 } from "lucide-react";
import { CompartmentEnum } from "@shared/schema";
import { useQueryClient } from "@tanstack/react-query";

interface OcrProcessingModalProps {
  state: "processing" | "success" | "error";
  result: any;
  onClose: () => void;
  onEdit: () => void;
  onConfirm: () => void;
}

const OcrProcessingModal: React.FC<OcrProcessingModalProps> = ({
  state,
  result,
  onClose,
  onEdit,
  onConfirm,
}) => {
  const [open, setOpen] = useState(true);
  const [selectedName, setSelectedName] = useState("");
  const [selectedCompartment, setSelectedCompartment] = useState("");
  const queryClient = useQueryClient();

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  // 當用戶選擇確認添加食品時處理
  const handleConfirm = async () => {
    try {
      // 準備要發送的數據，確保包含所有必要字段
      const foodData = {
        name: selectedName || result.name,
        category: result.category,
        expiryDate: result.expiryDate,
        compartment: selectedCompartment
      };

      // 驗證必要字段
      if (!foodData.name || !foodData.category || !foodData.expiryDate || !foodData.compartment) {
        alert('請確保所有必要信息都已填寫完整');
        return;
      }

      console.log('Sending food data:', foodData);

      // 直接發送API請求
      const response = await fetch('/api/food-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(foodData),
      });

      if (response.ok) {
        // 成功添加，關閉模態框
        onClose();
        // 刷新所有相關的查詢緩存，讓數據即時更新
        queryClient.invalidateQueries({ queryKey: ['/api/food-items'] });
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/food-items/expiring/5'] });
        queryClient.invalidateQueries({ queryKey: ['/api/food-items/expiring/30'] });
      } else {
        const errorData = await response.json();
        console.error('Failed to add food item:', errorData);
        alert('添加食品失敗，請重試');
      }
    } catch (error) {
      console.error('Error adding food item:', error);
      alert('添加食品時發生錯誤，請重試');
    }
  };

  // 翻譯
  const translations = {
    processing: "正在處理圖像",
    success: "成功識別食品",
    failed: "識別失敗",
    analyzing: "正在使用 Google Cloud Vision API 分析您的圖像...",
    successMessage: "成功識別食品！",
    productName: "食品名稱",
    category: "類別",
    expirationDate: "有效期限",
    otherOptions: "其他可能的選項",
    selectPlacement: "選擇存放位置",
    confirmMessage: "請確認或編輯以下資訊後添加到冰箱",
    errorMessage: "抱歉，無法識別食品",
    tryAgainMessage: "請嘗試上傳更清晰的圖片或手動添加",
    edit: "編輯",
    confirm: "確認並添加",
    tryAgain: "重試",
    addManually: "手動添加"
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {state === "processing" ? translations.processing : 
             state === "success" ? translations.success : 
             translations.failed}
          </DialogTitle>
          {state === "success" && (
            <DialogDescription>
              {translations.confirmMessage}
            </DialogDescription>
          )}
        </DialogHeader>
        
        {state === "processing" && (
          <div className="mb-6 py-8">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100"></div>
                <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500" style={{animationDuration: '1s'}}></div>
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-base font-medium text-gray-700 animate-pulse">圖像處理中...</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-xs animate-fade-in">
                  {translations.analyzing}
                </p>
                <div className="mt-4 flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {state === "success" && result && (
          <>
            <div className="flex items-center p-4 mb-4 bg-green-50 border-l-4 border-green-400 rounded-md animate-slide-up">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-green-200 animate-pulse"></div>
                  <CheckCircle className="h-6 w-6 text-green-500 relative z-10" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-700">{translations.successMessage}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* 食品信息 */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 animate-slide-up">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  偵測到的資訊：
                </h4>
                <div className="space-y-3">
                  <div className="animate-slide-up" style={{animationDelay: '0.1s'}}>
                    <p className="text-xs text-gray-500 flex items-center">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-1"></span>
                      {translations.productName}
                    </p>
                    <div className="flex items-center mt-1">
                      <p className="text-sm font-medium flex-1 text-gray-800">{result.name}</p>
                      {selectedName && selectedName !== result.name && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center animate-slide-up">
                          <Check className="h-3 w-3 mr-1" /> 已修改為: {selectedName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="animate-slide-up" style={{animationDelay: '0.2s'}}>
                    <p className="text-xs text-gray-500 flex items-center">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-1"></span>
                      {translations.category}
                    </p>
                    <p className="text-sm font-medium text-gray-800 mt-1">{result.category}</p>
                  </div>
                  <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
                    <p className="text-xs text-gray-500 flex items-center">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-1"></span>
                      {translations.expirationDate}
                    </p>
                    <p className="text-sm font-medium text-gray-800 mt-1">
                      {result.expiryDate instanceof Date 
                        ? result.expiryDate.toLocaleDateString() 
                        : new Date(result.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 其他可能的選項 */}
              {result.possibleResults && result.possibleResults.length > 0 && (
                <div className="mb-4 animate-slide-up" style={{animationDelay: '0.4s'}}>
                  <Label className="text-sm text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                    {translations.otherOptions}
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.possibleResults.map((name: string, index: number) => (
                      <Button 
                        key={name}
                        variant={selectedName === name ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedName(name)}
                        className={`flex items-center transition-all duration-300 ${selectedName === name ? "bg-blue-500 hover:bg-blue-600" : "hover:border-blue-400"}`}
                        style={{animationDelay: `${0.1 * (index + 5)}s`}}
                      >
                        {selectedName === name && <Check className="h-3 w-3 mr-1 animate-slide-up" />}
                        {name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 選擇存放夾層 */}
              <div className="mb-4 animate-slide-up" style={{animationDelay: '0.5s'}}>
                <Label htmlFor="compartment" className="text-sm text-gray-700 flex items-center">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                  {translations.selectPlacement}
                </Label>
                <Select 
                  value={selectedCompartment} 
                  onValueChange={setSelectedCompartment}
                >
                  <SelectTrigger className="mt-1 transition-all duration-300 border-gray-200 hover:border-blue-300">
                    <SelectValue placeholder="選擇存放位置" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CompartmentEnum.enum).map((comp) => (
                      <SelectItem key={comp} value={comp} className="hover:bg-blue-50">
                        {comp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedCompartment && (
                  <p className="text-xs text-amber-500 mt-1 animate-fade-in">請選擇一個存放位置才能繼續</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-4 animate-slide-up" style={{animationDelay: '0.6s'}}>
              <Button 
                variant="outline" 
                onClick={onEdit} 
                className="flex items-center transition-all duration-300 hover:bg-blue-50"
              >
                <Edit3 className="h-4 w-4 mr-1" />
                {translations.edit}
              </Button>
              <Button 
                onClick={handleConfirm} 
                disabled={!selectedCompartment}
                className={`flex items-center transition-all duration-300 ${selectedCompartment ? "bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]" : "opacity-70"}`}
              >
                <Check className="h-4 w-4 mr-1" />
                {translations.confirm}
              </Button>
            </div>
          </>
        )}
        
        {state === "error" && (
          <>
            <div className="flex items-center p-4 mb-4 bg-red-50 border-l-4 border-red-400 rounded-md animate-slide-up">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-red-200 animate-pulse"></div>
                  <XCircle className="h-6 w-6 text-red-500 relative z-10" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-700">{translations.errorMessage}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6 text-center animate-slide-up delayed-100">
              <div className="inline-block mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium mb-2">
                圖像識別失敗
              </p>
              <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">
                {translations.tryAgainMessage}
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 animate-slide-up delayed-200">
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="transition-all duration-300 hover:bg-gray-100 hover:border-gray-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {translations.tryAgain}
              </Button>
              <Button 
                onClick={onEdit}
                className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {translations.addManually}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OcrProcessingModal;
