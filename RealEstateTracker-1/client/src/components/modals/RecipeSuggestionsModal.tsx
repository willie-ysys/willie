import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChefHat, Clock, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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

interface RecipeSuggestionsModalProps {
  onClose: () => void;
}

const RecipeSuggestionsModal: React.FC<RecipeSuggestionsModalProps> = ({ onClose }) => {
  const [open, setOpen] = useState(true);

  const generateRecipesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/recipe-suggestions", {});
      const data = await response.json();
      console.log('Parsed API data:', data);
      return data;
    },
  });

  useEffect(() => {
    generateRecipesMutation.mutate();
  }, []);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleGenerateRecipes = () => {
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
    return '🍽️';
  };

  const recipeData = generateRecipesMutation.data as any;
  const suggestions = recipeData?.suggestions || [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            智能食譜建議
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {generateRecipesMutation.isPending && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <p>正在分析您的食材並生成食譜建議...</p>
            </div>
          )}

          {generateRecipesMutation.isError && (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">
                生成食譜建議時發生錯誤，請稍後再試
              </div>
              <Button onClick={handleGenerateRecipes} variant="outline">
                重新生成
              </Button>
            </div>
          )}

          {!generateRecipesMutation.isPending && !generateRecipesMutation.isError && suggestions.length === 0 && (
            <div className="text-center py-8">
              <ChefHat className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">沒有找到合適的食譜</h3>
              <p className="text-gray-600 mb-4">
                請先添加一些食材到您的冰箱中
              </p>
              <Button onClick={handleGenerateRecipes} variant="outline">
                重新生成
              </Button>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  為您找到 {suggestions.length} 個食譜建議
                </p>
                <Button onClick={handleGenerateRecipes} variant="outline" size="sm">
                  重新生成
                </Button>
              </div>

              <div className="grid gap-4">
                {suggestions.map((recipe: RecipeSuggestion, index: number) => (
                  <Card key={index} className="w-full overflow-hidden">
                    <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-2">{getRecipeIcon(recipe.name)}</div>
                        <h3 className="text-xl font-semibold text-gray-700">{recipe.name}</h3>
                      </div>
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{recipe.name}</CardTitle>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(recipe.priority)}>
                            {getPriorityText(recipe.priority)}
                          </Badge>
                          {recipe.expiringIngredients && recipe.expiringIngredients.length > 0 && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              使用即期食材
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600">{recipe.description}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {recipe.cookingTime}
                        </div>
                        <div>
                          難度：{recipe.difficulty}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">所需食材：</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {recipe.ingredients.map((ingredient, idx) => (
                            <li key={idx}>{ingredient}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">製作步驟：</h4>
                        <ol className="list-decimal list-inside text-sm space-y-1">
                          {recipe.instructions.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                      {recipe.tips && (
                        <div>
                          <h4 className="font-medium mb-2">烹飪小貼士：</h4>
                          <p className="text-sm text-gray-600">{recipe.tips}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
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

export default RecipeSuggestionsModal;