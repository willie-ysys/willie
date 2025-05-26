import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "../../hooks/use-local-storage";

interface WelcomeModalProps {
  onClose: (fridgeName: string) => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  const [open, setOpen] = useState(true);
  const [fridgeName, setFridgeName] = useState("");
  const [_, setStoredFridgeName] = useLocalStorage("fridgeName", "");

  const handleSave = () => {
    const finalName = fridgeName.trim() || "我的智能冰箱";
    setStoredFridgeName(finalName);
    setOpen(false);
    onClose(finalName);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        const finalName = fridgeName.trim() || "我的智能冰箱";
        setStoredFridgeName(finalName);
        onClose(finalName);
      }
      setOpen(open);
    }}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-blue-50 animate-fade-in">
        <DialogHeader className="animate-slide-down">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
          </div>
          <DialogTitle className="text-xl gradient-text text-center">歡迎使用智能冰箱管理系統</DialogTitle>
          <DialogDescription className="text-base text-center mt-2">
            請為您的冰箱取一個名稱，讓管理更個人化
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 space-y-6 animate-slide-up delayed-100">
          <div className="space-y-2">
            <Label htmlFor="fridgeName" className="text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              冰箱名稱
            </Label>
            <Input 
              id="fridgeName" 
              placeholder="例如：廚房的冰箱、家庭冰箱..." 
              value={fridgeName}
              onChange={(e) => setFridgeName(e.target.value)}
              autoFocus
              className="border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-300"
            />
            <p className="text-xs text-gray-500 mt-1 ml-4 animate-fade-in delayed-200">
              為您的冰箱取一個獨特的名字，讓它成為廚房的一員！
            </p>
          </div>
          
          <div className="flex justify-center pt-4 animate-slide-up delayed-300">
            <Button 
              onClick={handleSave} 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              開始使用
            </Button>
          </div>
          
          <div className="text-center text-xs text-gray-400 animate-fade-in delayed-300">
            點擊即表示您已準備好開始使用智能冰箱管理系統
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;