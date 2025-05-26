import { useRef } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlusIcon, CameraIcon, ChefHat } from "lucide-react";

interface QuickAddProps {
  onManualAdd: () => void;
  onImageUpload: (result: any, state: "processing" | "success" | "error") => void;
}

const QuickAdd: React.FC<QuickAddProps> = ({ onManualAdd, onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // First show the processing state
    onImageUpload(null, "processing");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      if (data.success) {
        // Show success state with detected info
        onImageUpload(data.detectedInfo, "success");
      } else {
        // Show error state
        onImageUpload(null, "error");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      onImageUpload(null, "error");
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your image.",
        variant: "destructive",
      });
    } finally {
      // Reset the input value to allow the same file to be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 card-hover animate-fade-in">
      <h2 className="text-lg font-semibold gradient-text mb-4">快速添加</h2>
      <div className="space-y-5">
        <Button 
          onClick={onManualAdd}
          className="w-full flex items-center justify-center space-x-2 bg-primary text-white
            hover:bg-primary-hover transition-colors duration-300 hover:shadow-lg 
            transform hover:scale-[1.02] active:scale-[0.98] animate-slide-up"
        >
          <PlusIcon className="h-5 w-5" />
          <span>手動添加食品</span>
        </Button>
        <div className="relative animate-slide-up delayed-100">
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="photo-upload" 
              className="flex flex-col items-center justify-center w-full h-36 border-2 
                border-blue-200 border-dashed rounded-lg cursor-pointer bg-blue-50 
                hover:bg-blue-100 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3 
                  group-hover:scale-110 transition-transform duration-300">
                  <CameraIcon className="w-6 h-6 text-blue-500 group-hover:text-blue-600 transition-colors" />
                </div>
                <p className="mb-1 text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                  <span className="font-semibold">點擊上傳圖片</span> 或拖放檔案
                </p>
                <p className="text-xs text-gray-500 text-center max-w-[200px]">
                  上傳產品包裝圖片自動識別食品資訊
                </p>
              </div>
              <input 
                id="photo-upload" 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuickAdd;
