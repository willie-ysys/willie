import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ChefHat, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { FoodItem } from "@shared/schema";

interface RecipeSuggestion {
  name: string;
  description: string;
  difficulty: string;
  cookingTime: string;
  ingredients: string[];
  instructions: string[];
  tips: string;
  priority: "high" | "medium" | "low";
  expiringIngredients: string[];
  imageUrl?: string;
}

const AutoRecipeSuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);

  // 獲取食材數據
  const { data: foodItems = [] } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  // 生成食譜建議的 mutation
  const generateRecipesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/recipe-suggestions", {});
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      setSuggestions(data.suggestions || []);
    },
  });

  // 當有食材時自動生成食譜
  useEffect(() => {
    if (foodItems.length > 0 && suggestions.length === 0) {
      generateRecipesMutation.mutate();
    }
  }, [foodItems.length]);

  const handleGenerateMore = () => {
    // 清除舊的建議，顯示加載狀態
    setSuggestions([]);
    // 重新生成食譜
    generateRecipesMutation.mutate();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "高優先級";
      case "medium":
        return "中優先級";
      case "low":
        return "低優先級";
      default:
        return "一般";
    }
  };

  // 為不同食譜選擇合適的圖標
  const getRecipeIcon = (name: string) => {
    if (name.includes('蛋')) return '🥚';
    if (name.includes('吐司')) return '🍞';
    if (name.includes('牛肉')) return '🥩';
    if (name.includes('雞')) return '🍗';
    if (name.includes('蘋果')) return '🍎';
    if (name.includes('火腿')) return '🥓';
    if (name.includes('辣椒')) return '🌶️';
    if (name.includes('三明治')) return '🥪';
    if (name.includes('湯')) return '🍲';
    if (name.includes('沙拉')) return '🥗';
    return '🍽️';
  };

  // 如果沒有食材，不顯示食譜區域
  if (foodItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChefHat className="h-6 w-6 text-orange-500" />
          <h2 className="text-2xl font-bold">智能食譜建議</h2>
        </div>
        <Button 
          onClick={handleGenerateMore}
          variant="outline"
          disabled={generateRecipesMutation.isPending}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${generateRecipesMutation.isPending ? 'animate-spin' : ''}`} />
          更新食譜
        </Button>
      </div>

      {generateRecipesMutation.isPending && suggestions.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-3 text-orange-500" />
          <p className="text-gray-600">正在分析您的食材並生成食譜建議...</p>
        </div>
      )}

      {generateRecipesMutation.isError && suggestions.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2 text-gray-700">生成食譜建議時發生錯誤</h3>
          <p className="text-gray-600 mb-4">請稍後再試</p>
          <Button onClick={handleGenerateMore} variant="outline">
            重新更新食譜
          </Button>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            根據您冰箱中的 {foodItems.length} 種食材，為您推薦 {suggestions.length} 個食譜（點擊「更新食譜」重新分析最新食材）
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((recipe, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="w-full h-32 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-1">{getRecipeIcon(recipe.name)}</div>
                    <h3 className="text-sm font-semibold text-gray-700">{recipe.name}</h3>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{recipe.name}</CardTitle>
                    <div className="flex gap-1">
                      <Badge className={getPriorityColor(recipe.priority)} variant="secondary">
                        {getPriorityText(recipe.priority)}
                      </Badge>
                      {recipe.expiringIngredients && recipe.expiringIngredients.length > 0 && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          即期
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{recipe.description}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {recipe.cookingTime}
                    </div>
                    <div>難度：{recipe.difficulty}</div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3 pt-0">
                  <div>
                    <h4 className="font-medium mb-1 text-sm">所需食材：</h4>
                    <ul className="text-xs space-y-1 text-gray-600">
                      {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                        <li key={idx}>• {ingredient}</li>
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <li className="text-gray-500">...等 {recipe.ingredients.length} 種食材</li>
                      )}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1 text-sm">製作步驟：</h4>
                    <ol className="text-xs space-y-1 text-gray-600">
                      {recipe.instructions.slice(0, 2).map((step, idx) => (
                        <li key={idx}>{idx + 1}. {step}</li>
                      ))}
                      {recipe.instructions.length > 2 && (
                        <li className="text-gray-500">...共 {recipe.instructions.length} 個步驟</li>
                      )}
                    </ol>
                  </div>
                  
                  {recipe.tips && (
                    <div>
                      <h4 className="font-medium mb-1 text-sm">小貼士：</h4>
                      <p className="text-xs text-gray-600">{recipe.tips}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoRecipeSuggestions;