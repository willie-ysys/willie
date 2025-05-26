import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Refrigerator, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface FridgeAccount {
  id: string;
  name: string;
  createdAt: string;
}

interface AccountSelectionModalProps {
  onAccountSelected: (account: FridgeAccount) => void;
}

const AccountSelectionModal = ({ onAccountSelected }: AccountSelectionModalProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [accounts, setAccounts] = useLocalStorage<FridgeAccount[]>("fridgeAccounts", []);
  const { toast } = useToast();

  const handleCreateAccount = () => {
    if (newAccountName.trim()) {
      const newAccount: FridgeAccount = {
        id: Date.now().toString(),
        name: newAccountName.trim(),
        createdAt: new Date().toISOString()
      };
      
      setAccounts([...accounts, newAccount]);
      toast({
        title: "成功！",
        description: `冰箱帳號 "${newAccount.name}" 已創建`,
      });
      onAccountSelected(newAccount);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
              <Refrigerator className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">智能冰箱管理系統</h1>
            <p className="text-gray-600">選擇您的冰箱帳號或創建新帳號</p>
          </div>

          <div className="space-y-6">
            {/* 現有帳號列表 */}
            {accounts && accounts.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Refrigerator className="h-5 w-5 mr-2 text-blue-600" />
                    現有冰箱帳號
                  </h2>
                  <div className="grid gap-3">
                    {accounts.map((account) => (
                      <Card 
                        key={account.id} 
                        className="cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-[1.02] border-2 hover:border-blue-300"
                        onClick={() => onAccountSelected(account)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <Refrigerator className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{account.name}</h3>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  創建於 {formatDate(account.createdAt)}
                                </div>
                              </div>
                            </div>
                            <div className="text-blue-600 font-medium">選擇 →</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* 創建新帳號 */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <PlusCircle className="h-5 w-5 mr-2 text-green-600" />
                  創建新冰箱帳號
                </h2>
                
                {!showCreateForm ? (
                  <Card className="cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-[1.02] border-2 border-dashed border-gray-300 hover:border-green-300">
                    <CardContent 
                      className="p-6 text-center"
                      onClick={() => setShowCreateForm(true)}
                    >
                      <PlusCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-lg text-green-600">創建新帳號</h3>
                      <p className="text-gray-500">為您的冰箱設定一個專屬名稱</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-2 border-green-300">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            冰箱帳號名稱
                          </label>
                          <Input
                            placeholder="例如：家庭冰箱、辦公室冰箱..."
                            value={newAccountName}
                            onChange={(e) => setNewAccountName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateAccount()}
                            className="text-lg"
                            autoFocus
                          />
                        </div>
                        <div className="flex space-x-3">
                          <Button 
                            onClick={handleCreateAccount}
                            disabled={!newAccountName.trim()}
                            className="flex-1"
                          >
                            創建帳號
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setShowCreateForm(false);
                              setNewAccountName("");
                            }}
                            className="flex-1"
                          >
                            取消
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSelectionModal;