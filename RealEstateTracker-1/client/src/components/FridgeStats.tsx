import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface FridgeStatsData {
  totalItems: number;
  expiringItems: number;
  categoriesCount: number;
  spaceUsed: number;
}

interface FridgeStatsProps {
  onShowAllItems?: () => void;
}

const FridgeStats: React.FC<FridgeStatsProps> = ({ onShowAllItems }) => {
  
  const { data, isLoading } = useQuery<FridgeStatsData>({
    queryKey: ['/api/stats', { fridgeAccountId: 1 }],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <Skeleton className="h-6 w-2/3 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-8 w-1/4" />
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-8 w-1/4" />
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-8 w-1/4" />
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-8 w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 card-hover animate-fade-in">
      <h2 className="text-lg font-semibold gradient-text mb-4">冰箱統計</h2>
      <div className="grid grid-cols-2 gap-4">
        <div 
          className="bg-gray-50 p-3 rounded-lg transition-all hover:bg-blue-50 animate-slide-up cursor-pointer hover:shadow-md"
          onClick={() => {
            console.log('總食品數被點擊了！');
            if (onShowAllItems && typeof onShowAllItems === 'function') {
              onShowAllItems();
            } else {
              console.log('函數不存在，手動觸發模態框');
              // 直接觸發自定義事件
              window.dispatchEvent(new CustomEvent('showAllItems'));
            }
          }}
        >
          <p className="text-sm text-gray-500">總食品數</p>
          <p className="text-2xl font-semibold text-gray-800">{data?.totalItems || 0}</p>
          <p className="text-xs text-blue-600 mt-1">點擊查看詳情</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg transition-all hover:bg-amber-50 animate-slide-up delayed-100">
          <p className="text-sm text-gray-500">即將到期</p>
          <p className="text-2xl font-semibold text-warning">{data?.expiringItems || 0}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg transition-all hover:bg-indigo-50 animate-slide-up delayed-200">
          <p className="text-sm text-gray-500">食品分類</p>
          <p className="text-2xl font-semibold text-gray-800">{data?.categoriesCount || 0}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg transition-all hover:bg-emerald-50 animate-slide-up delayed-300">
          <p className="text-sm text-gray-500">空間使用率</p>
          <div className="mt-1">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${data?.spaceUsed || 0}%` }}
              ></div>
            </div>
            <p className="text-sm font-semibold text-primary mt-1">{data?.spaceUsed || 0}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FridgeStats;
