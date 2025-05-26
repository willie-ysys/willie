import { useState } from 'react';
import { PlusCircleIcon } from 'lucide-react';
import fridgeImg from "@assets/fridge_clean.png";
import FridgeStats from './FridgeStats';
import QuickAdd from './QuickAdd';
import ExpiringItems from './ExpiringItems';
import { useQuery } from "@tanstack/react-query";
import { FoodItem } from "@shared/schema";

// 食品emoji映射
const getFoodEmoji = (name: string, category: string): string => {
  const foodName = name.toLowerCase();
  
  // 特定食品名稱映射
  if (foodName.includes('雞蛋') || foodName.includes('蛋')) return '🥚';
  if (foodName.includes('蘋果')) return '🍎';
  if (foodName.includes('香蕉')) return '🍌';
  if (foodName.includes('橘子') || foodName.includes('柳橙')) return '🍊';
  if (foodName.includes('草莓')) return '🍓';
  if (foodName.includes('葡萄')) return '🍇';
  if (foodName.includes('西瓜')) return '🍉';
  if (foodName.includes('桃子')) return '🍑';
  if (foodName.includes('檸檬')) return '🍋';
  if (foodName.includes('牛奶')) return '🥛';
  if (foodName.includes('起司') || foodName.includes('乳酪')) return '🧀';
  if (foodName.includes('優格')) return '🥛';
  if (foodName.includes('雞肉') || foodName.includes('雞腿')) return '🍗';
  if (foodName.includes('豬肉')) return '🥩';
  if (foodName.includes('牛肉')) return '🥩';
  if (foodName.includes('魚')) return '🐟';
  if (foodName.includes('蝦')) return '🦐';
  if (foodName.includes('麵包')) return '🍞';
  if (foodName.includes('米飯') || foodName.includes('飯')) return '🍚';
  if (foodName.includes('麵條') || foodName.includes('麵')) return '🍜';
  if (foodName.includes('番茄') || foodName.includes('西紅柿')) return '🍅';
  if (foodName.includes('紅蘿蔔') || foodName.includes('胡蘿蔔')) return '🥕';
  if (foodName.includes('洋蔥')) return '🧅';
  if (foodName.includes('馬鈴薯') || foodName.includes('土豆')) return '🥔';
  if (foodName.includes('玉米')) return '🌽';
  if (foodName.includes('高麗菜') || foodName.includes('包菜')) return '🥬';
  if (foodName.includes('花椰菜')) return '🥦';
  if (foodName.includes('茄子')) return '🍆';
  if (foodName.includes('青椒') || foodName.includes('甜椒')) return '🫑';
  
  // 根據分類映射
  switch(category) {
    case '乳製品': return '🥛';
    case '肉類': return '🍖';
    case '蔬菜水果': return '🥬';
    case '飲料': return '🥤';
    case '調味料': return '🧂';
    case '剩菜': return '🍽️';
    case '零食': return '🍪';
    default: return '🍽️';
  }
};

interface FridgeImageProps {
  onCompartmentClick: (compartment: string) => void;
}

type CompartmentInfo = {
  id: string;
  name: string;
  position: {
    top: string;
    left?: string;
    right?: string;
    width: string;
    height: string;
  };
};

const compartments: CompartmentInfo[] = [
  // 主冰箱內部架層 - 根據截圖精準調整位置
  { id: 'top-shelf', name: '頂層架', position: { top: '14%', left: '45.8%', width: '6%', height: '6%' }},
  { id: 'middle-shelf-1', name: '中層架1', position: { top: '26%', left: '45.8%', width: '6%', height: '6%' }},
  { id: 'middle-shelf-2', name: '中層架2', position: { top: '37%', left: '45.8%', width: '6%', height: '6%' }},
  { id: 'middle-shelf-3', name: '中層架3', position: { top: '48%', left: '45.8%', width: '6%', height: '6%' }},
  { id: 'bottom-shelf', name: '底層架', position: { top: '60%', left: '45.8%', width: '6%', height: '6%' }},
  // 蔬果保鮮盒
  { id: 'crisper-drawer', name: '蔬果盒', position: { top: '76%', left: '45.8%', width: '6%', height: '6%' }},
  // 左門架層 - 根據截圖調整到準確位置
  { id: 'left-door-1', name: '左門頂層', position: { top: '16%', left: '24%', width: '6%', height: '6%' }},
  { id: 'left-door-2', name: '左門上層', position: { top: '31%', left: '24%', width: '6%', height: '6%' }},
  { id: 'left-door-3', name: '左門下層', position: { top: '50%', left: '24%', width: '6%', height: '6%' }},
  { id: 'left-door-4', name: '左門底層', position: { top: '67%', left: '24%', width: '6%', height: '6%' }},
  // 右門架層 - 根據截圖調整到準確位置
  { id: 'right-door-1', name: '右門頂層', position: { top: '17%', right: '26.7%', width: '6%', height: '6%' }},
  { id: 'right-door-2', name: '右門上層', position: { top: '32%', right: '26.7%', width: '6%', height: '6%' }},
  { id: 'right-door-3', name: '右門下層', position: { top: '50%', right: '26.7%', width: '6%', height: '6%' }},
  { id: 'right-door-4', name: '右門底層', position: { top: '66%', right: '26.7%', width: '6%', height: '6%' }},
];

const FridgeImage: React.FC<FridgeImageProps> = ({ onCompartmentClick }) => {
  // 獲取所有食品數據
  const { data: allFoodItems } = useQuery<FoodItem[]>({
    queryKey: ['/api/food-items'],
  });

  // 根據夾層食品數量返回按鈕顏色
  const getButtonColor = (compartmentName: string) => {
    if (!allFoodItems) return 'bg-white border-gray-300'; // 載入中時顯示白色
    
    const itemsInCompartment = allFoodItems.filter(item => item.compartment === compartmentName);
    const count = itemsInCompartment.length;
    
    if (count === 0) {
      return 'bg-white border-gray-300 text-gray-600'; // 沒東西為白色
    } else if (count >= 1 && count <= 3) {
      return 'bg-blue-500 border-blue-600 text-white'; // 1-3個物品為藍色
    } else {
      return 'bg-red-500 border-red-600 text-white'; // 3個以上為紅色
    }
  };

  return (
    <div className="relative w-full overflow-auto">
      {/* 冰箱圖片容器 - 充滿左右邊界，可滾動查看 */}
      <div 
        className="relative bg-center bg-no-repeat bg-cover w-full"
        style={{ 
          backgroundImage: `url(${fridgeImg})`,
          height: '120vh', // 讓圖片高度超過視窗高度，可以滾動查看
          minHeight: '800px'
        }}
      >
        {/* 所有浮動內容 */}
        <div className="absolute inset-0 z-10">

        {/* 夾層可視化邊框 - 每個按鈕對應一個區域 */}
        
        {/* 主冰箱內部區域 - 綠色邊框 */}
        
        {/* 頂層架 */}
        <div
          className="absolute border-2 border-dashed opacity-60 z-5 hidden"
          style={{
            top: '13%',           // 調整頂層架上下位置
            left: '39%',          // 調整頂層架左右位置  
            width: '20%',         // 調整頂層架寬度
            height: '7%',         // 調整頂層架高度
            borderColor: '#10b981'
          }}
          title="頂層架可用空間"
        />

        {/* 中層架1 */}
        <div
          className="absolute border-2 border-dashed opacity-60 z-5 hidden"
          style={{
            top: '25%',           // 調整中層架1上下位置
            left: '39%',          // 調整中層架1左右位置
            width: '20%',         // 調整中層架1寬度
            height: '7%',         // 調整中層架1高度
            borderColor: '#10b981'
          }}
          title="中層架1可用空間"
        />

        {/* 中層架2 */}
        <div
          className="absolute border-2 border-dashed opacity-60 z-5 hidden"
          style={{
            top: '36%',           // 調整中層架2上下位置
            left: '39%',          // 調整中層架2左右位置
            width: '20%',         // 調整中層架2寬度
            height: '7%',         // 調整中層架2高度
            borderColor: '#10b981'
          }}
          title="中層架2可用空間"
        />

        {/* 中層架3 */}
        <div
          className="absolute border-2 border-dashed opacity-60 z-5 hidden"
          style={{
            top: '47%',           // 調整中層架3上下位置
            left: '39%',          // 調整中層架3左右位置
            width: '20%',         // 調整中層架3寬度
            height: '7%',         // 調整中層架3高度
            borderColor: '#10b981'
          }}
          title="中層架3可用空間"
        />

        {/* 底層架 */}
        <div
          className="absolute border-2 border-dashed opacity-60 z-5 hidden"
          style={{
            top: '59%',           // 調整底層架上下位置
            left: '39%',          // 調整底層架左右位置
            width: '20%',         // 調整底層架寬度
            height: '7%',         // 調整底層架高度
            borderColor: '#10b981'
          }}
          title="底層架可用空間"
        />

        {/* 蔬果盒 */}
        <div
          className="absolute border-2 border-dashed opacity-60 z-5 hidden"
          style={{
            top: '75%',           // 調整蔬果盒上下位置
            left: '39%',          // 調整蔬果盒左右位置
            width: '20%',         // 調整蔬果盒寬度
            height: '7%',         // 調整蔬果盒高度
            borderColor: '#10b981'
          }}
          title="蔬果盒可用空間"
        />

        {/* 左門區域 - 紅色邊框 */}
        
        {/* 左門頂層 */}
        <div
          className="absolute border-2 border-dashed opacity-60 z-5 hidden"
          style={{
            top: '16%',           // 調整左門頂層上下位置
            left: '25%',           // 調整左門頂層左右位置
            width: '8%',         // 調整左門頂層寬度
            height: '4%',        // 調整左門頂層高度
            borderColor: '#ef4444'
          }}
          title="左門頂層可用空間"
        />

        {/* 左門上層 */}
        <div
          className="absolute border-2 border-dashed opacity-60 z-5 hidden"
          style={{
            top: '32%',           // 調整左門上層上下位置
            left: '25%',           // 調整左門上層左右位置
            width: '8%',         // 調整左門上層寬度
            height: '4%',        // 調整左門上層高度
            borderColor: '#ef4444'
          }}
          title="左門上層可用空間"
        />

        {/* 左門下層 */}
        <div
          className="absolute border-2 border-dashed opacity-60 z-5 hidden"
          style={{
            top: '51%',           // 調整左門下層上下位置
            left: '25%',           // 調整左門下層左右位置
            width: '8%',         // 調整左門下層寬度
            height: '4%',        // 調整左門下層高度
            borderColor: '#ef4444'
          }}
          title="左門下層可用空間"
        />

        {/* 左門底層 */}
        <div
          className="absolute border-2 border-dashed opacity-60 z-5 hidden"
          style={{
            top: '68%',           // 調整左門底層上下位置
            left: '25%',           // 調整左門底層左右位置
            width: '8%',         // 調整左門底層寬度
            height: '4%',        // 調整左門底層高度
            borderColor: '#ef4444'
          }}
          title="左門底層可用空間"
        />

        {/* 右門區域 - 藍色邊框 */}
        
        {/* 右門頂層 */}
        <div
          className="absolute border-2 border-dashed opacity-60 z-5 hidden"
          style={{
            top: '18%',           // 調整右門頂層上下位置
            right: '27%',          // 調整右門頂層左右位置
            width: '8%',         // 調整右門頂層寬度
            height: '4%',        // 調整右門頂層高度
            borderColor: '#3b82f6'
          }}
          title="右門頂層可用空間"
        />

        {/* 右門上層 */}
        <div
          className="absolute border-2 border-dashed opacity-60 z-5 hidden"
          style={{
            top: '33%',           // 調整右門上層上下位置
            right: '27%',          // 調整右門上層左右位置
            width: '8%',         // 調整右門上層寬度
            height: '4%',        // 調整右門上層高度
            borderColor: '#3b82f6'
          }}
          title="右門上層可用空間"
        />

        {/* 右門下層 */}
        <div
          className="absolute border-2 border-dashed opacity-60 z-5 hidden"
          style={{
            top: '51%',           // 調整右門下層上下位置
            right: '27%',          // 調整右門下層左右位置
            width: '8%',         // 調整右門下層寬度
            height: '4%',        // 調整右門下層高度
            borderColor: '#3b82f6'
          }}
          title="右門下層可用空間"
        />

        {/* 右門底層 */}
        <div
          className="absolute border-2 border-dashed opacity-60 z-5 hidden"
          style={{
            top: '67%',           // 調整右門底層上下位置
            right: '27%',          // 調整右門底層左右位置
            width: '8%',         // 調整右門底層寬度
            height: '4%',        // 調整右門底層高度
            borderColor: '#3b82f6'
          }}
          title="右門底層可用空間"
        />

        {/* 加號按鈕群 */}
        {compartments.map((compartment) => {
          const itemsInCompartment = allFoodItems?.filter(item => item.compartment === compartment.name) || [];
          
          let buttonStyle = {};
          if (compartment.id.includes('left-door')) {
            buttonStyle = { right: '0', top: '50%', transform: 'translateY(-50%)' };
          } else if (compartment.id.includes('right-door')) {
            buttonStyle = { left: '0', top: '50%', transform: 'translateY(-50%)' };
          } else if (compartment.id.includes('crisper')) {
            buttonStyle = { left: '50%', top: '40%', transform: 'translate(-50%, -50%)' };
          } else {
            buttonStyle = { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
          }

          return (
            <div
              key={compartment.id}
              className="absolute"
              style={{
                top: compartment.position.top,
                left: compartment.position.left,
                right: compartment.position.right,
                width: compartment.position.width,
                height: compartment.position.height,
              }}
            >
              {/* 添加按鈕 */}
              <button 
                onClick={() => onCompartmentClick(compartment.name)}
                className={`absolute rounded-full shadow-lg flex items-center justify-center 
                  transition-all duration-300 z-10 w-8 h-8 border-2
                  hover:scale-110 hover:rotate-3 ${getButtonColor(compartment.name)}`}
                style={buttonStyle}
                title={`添加到${compartment.name}`}
              >
                <PlusCircleIcon className="h-6 w-6" />
              </button>
            </div>
          );
        })}

        {/* 食品emoji按鈕 - 獨立定位系統，直接相對於冰箱容器 */}
        {(() => {
          // 收集所有食品並為每個夾層分組
          const allItems = allFoodItems || [];
          const usedPositions: {left: number, top: number}[] = [];
          
          return allItems.map((item, index) => {
            const emoji = getFoodEmoji(item.name, item.category);
            
            // 根據您更新的彩色邊框座標精確設定emoji範圍
            let areaConfig = { leftMin: 0, leftMax: 0, topMin: 0, topMax: 0, useRight: false };
            
            // 左門區域：left 25% + width 8%
            if (item.compartment === '左門頂層') {
              areaConfig = { leftMin: 25, leftMax: 33, topMin: 16, topMax: 20, useRight: false };
            } else if (item.compartment === '左門上層') {
              areaConfig = { leftMin: 25, leftMax: 33, topMin: 32, topMax: 36, useRight: false };
            } else if (item.compartment === '左門下層') {
              areaConfig = { leftMin: 25, leftMax: 33, topMin: 51, topMax: 55, useRight: false };
            } else if (item.compartment === '左門底層') {
              areaConfig = { leftMin: 25, leftMax: 33, topMin: 68, topMax: 72, useRight: false };
            } 
            // 右門區域：right 27% + width 8%
            else if (item.compartment === '右門頂層') {
              areaConfig = { leftMin: 27, leftMax: 35, topMin: 18, topMax: 22, useRight: true };
            } else if (item.compartment === '右門上層') {
              areaConfig = { leftMin: 27, leftMax: 35, topMin: 33, topMax: 37, useRight: true };
            } else if (item.compartment === '右門下層') {
              areaConfig = { leftMin: 27, leftMax: 35, topMin: 51, topMax: 55, useRight: true };
            } else if (item.compartment === '右門底層') {
              areaConfig = { leftMin: 27, leftMax: 35, topMin: 67, topMax: 71, useRight: true };
            } 
            // 主冰箱內部：left 39% + width 20%
            else if (item.compartment === '頂層架') {
              areaConfig = { leftMin: 39, leftMax: 59, topMin: 13, topMax: 20, useRight: false };
            } else if (item.compartment === '中層架1') {
              areaConfig = { leftMin: 39, leftMax: 59, topMin: 25, topMax: 32, useRight: false };
            } else if (item.compartment === '中層架2') {
              areaConfig = { leftMin: 39, leftMax: 59, topMin: 36, topMax: 43, useRight: false };
            } else if (item.compartment === '中層架3') {
              areaConfig = { leftMin: 39, leftMax: 59, topMin: 47, topMax: 54, useRight: false };
            } else if (item.compartment === '底層架') {
              areaConfig = { leftMin: 39, leftMax: 59, topMin: 59, topMax: 66, useRight: false };
            } 
            // 蔬果盒：left 39% + width 20%
            else if (item.compartment === '蔬果盒') {
              areaConfig = { leftMin: 39, leftMax: 59, topMin: 75, topMax: 82, useRight: false };
            }
            
            // 尋找不重疊的位置（避免與emoji和按鈕重疊）
            let finalLeft = 0;
            let finalTop = 0;
            let attempts = 0;
            
            do {
              const seed = parseInt(item.id?.toString().slice(-3) || '0') + index + attempts * 23;
              finalLeft = areaConfig.leftMin + (seed * 37) % (areaConfig.leftMax - areaConfig.leftMin);
              finalTop = areaConfig.topMin + (seed * 73) % (areaConfig.topMax - areaConfig.topMin);
              
              // 檢查是否與其他emoji重疊
              const isOverlappingWithEmoji = usedPositions.some(pos => {
                const distance = Math.sqrt((finalLeft - pos.left) ** 2 + (finalTop - pos.top) ** 2);
                return distance < 3;
              });
              
              // 檢查是否與加號按鈕重疊（按鈕通常在格子中央或邊緣）
              let isOverlappingWithButton = false;
              
              // 左右門按鈕位置檢查
              if (item.compartment.includes('左門') || item.compartment.includes('右門')) {
                if (areaConfig.useRight) {
                  // 右門：按鈕在格子左邊緣，避免最左側區域
                  isOverlappingWithButton = finalLeft < areaConfig.leftMin + 4;
                } else {
                  // 左門：按鈕在格子右邊緣，避免最右側區域  
                  isOverlappingWithButton = finalLeft > areaConfig.leftMax - 4;
                }
              } else {
                // 主冰箱內部按鈕在中央，避免中央區域
                const centerLeft = (areaConfig.leftMin + areaConfig.leftMax) / 2;
                const centerTop = (areaConfig.topMin + areaConfig.topMax) / 2;
                const distanceFromCenter = Math.sqrt((finalLeft - centerLeft) ** 2 + (finalTop - centerTop) ** 2);
                isOverlappingWithButton = distanceFromCenter < 3; // 避免按鈕中央3%範圍
              }
              
              if (!isOverlappingWithEmoji && !isOverlappingWithButton) {
                usedPositions.push({ left: finalLeft, top: finalTop });
                break;
              }
              
              attempts++;
            } while (attempts < 15);
            
            // 備用網格位置
            if (attempts >= 15) {
              finalLeft = areaConfig.leftMin + (index % 4) * 4;
              finalTop = areaConfig.topMin + Math.floor(index / 4) * 2;
              usedPositions.push({ left: finalLeft, top: finalTop });
            }
            
            // 正確處理左右門的定位
            let emojiStyle;
            if (areaConfig.useRight) {
              // 右門：直接使用 right 屬性，finalLeft 已經是從右邊的距離
              emojiStyle = { right: `${finalLeft}%`, top: `${finalTop}%`, left: 'auto' };
            } else {
              // 左門和中間：正常使用 left 屬性
              emojiStyle = { left: `${finalLeft}%`, top: `${finalTop}%`, right: 'auto' };
            }
            
            // 為每個emoji隨機分配漂浮動畫
            const animationTypes = ['animate-float-1', 'animate-float-2', 'animate-float-3', 'animate-float-bounce'];
            const animationClass = animationTypes[parseInt(item.id?.toString() || '0') % animationTypes.length];
            const animationDelay = `${(parseInt(item.id?.toString() || '0') % 8) * 0.3}s`;
            
            return (
              <button
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`${item.name}\n分類: ${item.category}\n過期日期: ${item.expiryDate}\n位置: ${item.compartment}`);
                }}
                className={`absolute bg-white/90 rounded-full shadow-md hover:shadow-xl 
                          transition-all duration-300 hover:scale-125 z-30
                          w-7 h-7 flex items-center justify-center border border-gray-200
                          hover:bg-white text-lg ${animationClass} hover:animate-pulse`}
                style={{
                  ...emojiStyle,
                  animationDelay,
                }}
                title={`${item.name} - 點擊查看詳情`}
              >
                {emoji}
              </button>
            );
          });
        })()}

        {/* 統計資訊浮在右上 */}
        <div className="absolute top-6 right-6 w-[300px] max-w-sm">
          <FridgeStats />
        </div>

        {/* 快速添加浮在右下 */}
        <div className="absolute bottom-6 right-6 w-[300px] max-w-sm">
          {/* QuickAdd 已移到主頁面中 */}
        </div>

        {/* 即將到期清單浮在左下 */}
        <div className="absolute bottom-6 left-6 w-[300px] max-w-sm">
          <ExpiringItems />
        </div>
        </div>
      </div>
    </div>
  );
};

export default FridgeImage;
