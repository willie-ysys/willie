import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createEmailJSService } from "@/lib/emailService";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Bell, Clock, Send } from "lucide-react";

interface EmailSettingsModalProps {
  onClose: () => void;
}

const EmailSettingsModal: React.FC<EmailSettingsModalProps> = ({ onClose }) => {
  const [open, setOpen] = useState(true);
  const [email, setEmail] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderDays, setReminderDays] = useState("3");
  const [emailjsServiceId, setEmailjsServiceId] = useState("");
  const [emailjsTemplateId, setEmailjsTemplateId] = useState("");
  const [emailjsPublicKey, setEmailjsPublicKey] = useState("");
  const { toast } = useToast();

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  // 發送測試郵件
  const testEmailMutation = useMutation({
    mutationFn: async () => {
      const emailService = createEmailJSService();
      if (!emailService) {
        throw new Error("EmailJS 服務未配置");
      }
      
      // 模擬即將過期的食品用於測試
      const testItems = [
        { 
          id: 1, 
          name: "測試雞蛋", 
          category: "肉類", 
          compartment: "中層架2", 
          expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
        }
      ];
      
      return await emailService.sendExpiryReminder(email, testItems as any);
    },
    onSuccess: () => {
      toast({
        title: "測試成功",
        description: "過期提醒已發送！請檢查您的郵箱（或控制台日誌）",
      });
    },
    onError: (error) => {
      toast({
        title: "發送失敗",
        description: "郵件發送過程中發生錯誤",
        variant: "destructive",
      });
    }
  });

  // 啟用自動檢查
  const enableAutoCheckMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auto-check-expiry", {
        email
      });
    },
    onSuccess: () => {
      toast({
        title: "設定成功",
        description: "自動過期檢查已啟用",
      });
    },
    onError: (error) => {
      toast({
        title: "設定失敗",
        description: "無法啟用自動檢查",
        variant: "destructive",
      });
    }
  });

  const handleSaveSettings = () => {
    if (!email) {
      toast({
        title: "請輸入郵箱",
        description: "需要有效的郵箱地址才能設定提醒",
        variant: "destructive",
      });
      return;
    }

    // 儲存設定到本地存儲
    localStorage.setItem('fridgeEmailSettings', JSON.stringify({
      email,
      reminderEnabled,
      reminderDays
    }));

    toast({
      title: "設定已儲存",
      description: "郵件提醒設定已成功儲存",
    });
    
    handleClose();
  };

  // 載入已儲存的設定
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('fridgeEmailSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setEmail(settings.email || "");
      setReminderEnabled(settings.reminderEnabled !== false);
      setReminderDays(settings.reminderDays || "3");
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            郵件提醒設定
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 郵箱設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-4 w-4" />
                郵箱地址
              </CardTitle>
              <CardDescription>
                設定接收過期提醒的郵箱地址
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">郵箱地址</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 提醒設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-4 w-4" />
                提醒設定
              </CardTitle>
              <CardDescription>
                自訂過期提醒的頻率和時間
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>啟用郵件提醒</Label>
                  <p className="text-sm text-muted-foreground">
                    當食品即將過期時發送郵件通知
                  </p>
                </div>
                <Switch
                  checked={reminderEnabled}
                  onCheckedChange={setReminderEnabled}
                />
              </div>

              <div>
                <Label htmlFor="reminderDays">提前提醒天數</Label>
                <Select value={reminderDays} onValueChange={setReminderDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1天前</SelectItem>
                    <SelectItem value="2">2天前</SelectItem>
                    <SelectItem value="3">3天前</SelectItem>
                    <SelectItem value="5">5天前</SelectItem>
                    <SelectItem value="7">一週前</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 測試功能 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="h-4 w-4" />
                測試功能
              </CardTitle>
              <CardDescription>
                立即測試郵件提醒功能
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => testEmailMutation.mutate()}
                disabled={!email || testEmailMutation.isPending}
                className="w-full"
                variant="outline"
              >
                {testEmailMutation.isPending ? "發送中..." : "發送測試郵件"}
              </Button>
              
              <Button
                onClick={() => enableAutoCheckMutation.mutate()}
                disabled={!email || enableAutoCheckMutation.isPending}
                className="w-full"
                variant="outline"
              >
                {enableAutoCheckMutation.isPending ? "設定中..." : "啟用自動檢查"}
              </Button>
            </CardContent>
          </Card>

          {/* 說明文字 */}
          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium mb-2">📧 郵件服務說明：</h4>
            <ul className="space-y-1 text-xs">
              <li>• 目前使用開發模式，提醒會顯示在控制台日誌中</li>
              <li>• 如需真實郵件發送，請提供 SendGrid API 金鑰</li>
              <li>• 測試功能會立即檢查當前的過期食品</li>
            </ul>
          </div>

          {/* 操作按鈕 */}
          <div className="flex gap-3">
            <Button onClick={handleClose} variant="outline" className="flex-1">
              取消
            </Button>
            <Button onClick={handleSaveSettings} className="flex-1">
              儲存設定
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailSettingsModal;