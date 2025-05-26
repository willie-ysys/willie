import FridgeImage from "@/components/FridgeImage";
import FridgeStats from "@/components/FridgeStats";
import QuickAdd from "@/components/QuickAdd";
import ExpiringItems from "@/components/ExpiringItems";
import AutoRecipeSuggestions from "@/components/AutoRecipeSuggestions";
import { useState, useEffect, useCallback } from "react";
import CompartmentModal from "@/components/modals/CompartmentModal";
import AddItemModal from "@/components/modals/AddItemModal";
import OcrProcessingModal from "@/components/modals/OcrProcessingModal";
import WelcomeModal from "@/components/modals/WelcomeModal";
import RecipeSuggestionsModal from "@/components/modals/RecipeSuggestionsModal";
import AllItemsModal from "@/components/modals/AllItemsModal";
import AccountSelectionModal from "@/components/modals/AccountSelectionModal";
import EmailSettingsModal from "@/components/modals/EmailSettingsModal";
import NotificationManager from "@/components/NotificationManager";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ModalState {
  accountSelection: boolean;
  welcome: boolean;
  compartment: boolean;
  addItem: boolean;
  ocrProcessing: boolean;
  recipeSuggestions: boolean;
  allItems: boolean;
  emailSettings: boolean;
}

interface FridgeAccount {
  id: string;
  name: string;
  createdAt: string;
}

const Home = () => {
  const [activeCompartment, setActiveCompartment] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>({
    accountSelection: true,
    welcome: false,
    compartment: false,
    addItem: false,
    ocrProcessing: false,
    recipeSuggestions: false,
    allItems: false,
    emailSettings: false,
  });
  
  const [currentAccount, setCurrentAccount] = useLocalStorage<FridgeAccount | null>("currentFridgeAccount", null);
  const [fridgeName, setFridgeName] = useLocalStorage("fridgeName", "");
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [ocrState, setOcrState] = useState<"processing" | "success" | "error">("processing");
  const { toast } = useToast();

  useEffect(() => {
    if (fridgeName && fridgeName.trim() !== "") {
      setModalState(prev => ({ ...prev, welcome: false }));
    } else {
      // 如果沒有冰箱名稱，確保顯示歡迎模態視窗
      setModalState(prev => ({ ...prev, welcome: true }));
    }
  }, [fridgeName]);

  // 添加自定義事件監聽器用於顯示所有項目
  useEffect(() => {
    const handleShowAllItems = () => {
      console.log('自定義事件被觸發！');
      setModalState(prev => ({ ...prev, allItems: true }));
    };

    window.addEventListener('showAllItems', handleShowAllItems);
    return () => {
      window.removeEventListener('showAllItems', handleShowAllItems);
    };
  }, []);

  const { data: compartmentItems = [] } = useQuery({
    queryKey: ['/api/food-items/compartment', activeCompartment],
    queryFn: () => {
      if (!activeCompartment) return Promise.resolve([]);
      return fetch(`/api/food-items/compartment/${encodeURIComponent(activeCompartment)}`).then(res => {
        if (!res.ok) throw new Error('Failed to fetch compartment items');
        return res.json();
      });
    },
    enabled: !!activeCompartment && modalState.compartment,
  });

  const handleCompartmentClick = (compartment: string) => {
    setActiveCompartment(compartment);
    setModalState({
      ...modalState,
      compartment: true,
      addItem: false,
      ocrProcessing: false
    });
  };

  const handleAddItem = (compartment?: string) => {
    console.log('handleAddItem called with compartment:', compartment);
    if (compartment) {
      setActiveCompartment(compartment);
    }
    setModalState(prev => ({
      welcome: false,
      compartment: false,
      addItem: true,
      ocrProcessing: false,
      recipeSuggestions: false,
      allItems: false, emailSettings: false
    }));
    console.log('Modal state updated to show addItem modal');
  };

  const handleOcrProcessing = (result: any, state: "processing" | "success" | "error") => {
    setOcrResult(result);
    setOcrState(state);
    setModalState({
      ...modalState,
      welcome: false,
      compartment: false,
      addItem: false,
      ocrProcessing: true,
      recipeSuggestions: false
    });
  };

  const closeAllModals = () => {
    setModalState({
      accountSelection: false,
      welcome: false,
      compartment: false,
      addItem: false,
      ocrProcessing: false,
      recipeSuggestions: false,
      allItems: false, emailSettings: false
    });
  };

  const handleAccountSelected = (account: FridgeAccount) => {
    setCurrentAccount(account);
    setFridgeName(account.name);
    setModalState({
      accountSelection: false,
      welcome: false,
      compartment: false,
      addItem: false,
      ocrProcessing: false,
      recipeSuggestions: false,
      allItems: false, emailSettings: false
    });
  };

  const handleShowAllItems = useCallback(() => {
    console.log('handleShowAllItems 被調用了！');
    setModalState(prev => {
      console.log('設置 allItems 模態框為 true');
      return { ...prev, allItems: true };
    });
  }, []);

  const handleWelcomeClose = (name: string) => {
    setFridgeName(name);
    setModalState(prev => ({
      ...prev,
      welcome: false
    }));
  };

  const handleResetFridge = () => {
    setModalState(prev => ({
      ...prev,
      accountSelection: true
    }));
  };

  // 檢查是否已選擇帳號
  useEffect(() => {
    if (!currentAccount) {
      setModalState(prev => ({ ...prev, accountSelection: true }));
    }
  }, [currentAccount]);

  const handleRecipeSuggestions = () => {
    setModalState(prev => ({
      ...prev,
      recipeSuggestions: true
    }));
  };

  return (
    <div className="min-h-screen h-fit overflow-y-auto relative">
      {fridgeName && (
        <div className="absolute top-4 left-4 z-20 bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold gradient-text">{fridgeName}</h2>
            <button
              onClick={handleResetFridge}
              className="text-sm text-blue-500 hover:text-blue-700 transition-colors duration-300 
                px-2 py-1 rounded hover:bg-blue-50 flex items-center space-x-1"
              title="重新命名冰箱"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>設定</span>
            </button>
          </div>
        </div>
      )}

      <FridgeImage onCompartmentClick={handleCompartmentClick} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        <div className="lg:col-span-1">
          <FridgeStats onShowAllItems={handleShowAllItems} />
        </div>
        <div className="lg:col-span-1">
          <QuickAdd 
            onManualAdd={() => handleAddItem()}
            onImageUpload={handleOcrProcessing}
          />
        </div>
        <div className="lg:col-span-1">
          <ExpiringItems />
        </div>
      </div>

      {/* 自動食譜建議區域 */}
      <div className="p-6">
        <AutoRecipeSuggestions />
      </div>

      {/* Modals */}
      {modalState.welcome && <WelcomeModal onClose={handleWelcomeClose} />}

      {modalState.compartment && (
        <CompartmentModal
          compartmentName={activeCompartment || ""}
          items={compartmentItems}
          onClose={closeAllModals}
          onAddItem={() => handleAddItem(activeCompartment || undefined)}
        />
      )}

      {modalState.addItem && (
        <AddItemModal
          compartment={activeCompartment}
          onClose={closeAllModals}
          initialData={ocrResult}
        />
      )}

      {modalState.ocrProcessing && (
        <OcrProcessingModal
          state={ocrState}
          result={ocrResult}
          onClose={closeAllModals}
          onEdit={() => {
            setModalState({
              welcome: false,
              compartment: false,
              addItem: true,
              ocrProcessing: false,
              recipeSuggestions: false,
              allItems: false, emailSettings: false
            });
          }}
          onConfirm={() => {
            if (ocrResult && ocrResult.compartment) {
              apiRequest("POST", "/api/food-items", ocrResult)
                .then(() => {
                  toast({
                    title: "新增成功",
                    description: `${ocrResult.name}已成功添加到${ocrResult.compartment}`,
                  });
                  queryClient.invalidateQueries({ queryKey: ['/api/food-items/compartment'] });
                  queryClient.invalidateQueries({ queryKey: ['/api/food-items/expiring'] });
                  queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
                })
                .catch(() => {
                  toast({
                    title: "錯誤",
                    description: "添加食品失敗，請重試",
                    variant: "destructive",
                  });
                });
            }
            closeAllModals();
          }}
        />
      )}

      {modalState.recipeSuggestions && (
        <RecipeSuggestionsModal 
          onClose={closeAllModals}
        />
      )}

      {modalState.allItems && (
        <AllItemsModal 
          onClose={closeAllModals}
          onEdit={(item) => {
            // 設置編輯數據並開啟編輯模態框
            setOcrResult(item);
            setModalState({
              welcome: false,
              compartment: false,
              addItem: true,
              ocrProcessing: false,
              recipeSuggestions: false,
              allItems: false, emailSettings: false
            });
          }}
        />
      )}

      {modalState.accountSelection && (
        <AccountSelectionModal 
          onAccountSelected={handleAccountSelected}
        />
      )}
    </div>
  );
};

export default Home;
