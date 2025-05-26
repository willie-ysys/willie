import { FoodItem } from "../shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

// 內建食譜資料庫
const recipeDatabase = [
  {
    name: "香煎蛋餅",
    baseIngredients: ["雞蛋", "蔥", "麵粉"],
    matchWords: ["蛋", "蔥", "餅"],
    description: "簡單美味的台式早餐",
    difficulty: "簡單",
    cookingTime: "15分鐘",
    instructions: [
      "將雞蛋打散，加入切好的蔥花",
      "平底鍋刷油，倒入蛋液攤成薄餅",
      "小火煎至兩面金黃即可"
    ],
    tips: "可以加入一些胡椒粉增加香味"
  },
  {
    name: "牛奶吐司",
    baseIngredients: ["吐司", "鮮奶", "雞蛋"],
    matchWords: ["吐司", "牛奶", "鮮奶", "蛋"],
    description: "香甜軟嫩的法式吐司",
    difficulty: "簡單",
    cookingTime: "10分鐘",
    instructions: [
      "將牛奶和雞蛋打勻成蛋奶液",
      "吐司兩面沾滿蛋奶液",
      "平底鍋小火煎至兩面金黃"
    ],
    tips: "可以撒上肉桂粉或淋上蜂蜜"
  },
  {
    name: "蘋果沙拉",
    baseIngredients: ["蘋果"],
    matchWords: ["蘋果", "水果"],
    description: "清爽健康的水果沙拉",
    difficulty: "簡單",
    cookingTime: "5分鐘",
    instructions: [
      "蘋果洗淨去核切片",
      "淋上檸檬汁防止氧化",
      "可加入優格或蜂蜜調味"
    ],
    tips: "即將過期的蘋果做成沙拉是很好的選擇"
  },
  {
    name: "蔥花炒蛋",
    baseIngredients: ["雞蛋", "蔥"],
    matchWords: ["蛋", "蔥"],
    description: "經典家常菜",
    difficulty: "簡單",
    cookingTime: "8分鐘",
    instructions: [
      "雞蛋打散，加入鹽調味",
      "蔥洗淨切成蔥花",
      "熱鍋下油，倒入蛋液炒至半熟",
      "撒入蔥花繼續炒勻即可"
    ],
    tips: "火候不要太大，保持蛋的嫩滑"
  },
  {
    name: "簡易三明治",
    baseIngredients: ["吐司"],
    matchWords: ["吐司", "麵包"],
    description: "快速營養的輕食",
    difficulty: "簡單",
    cookingTime: "5分鐘",
    instructions: [
      "吐司烤至微焦",
      "可夾入雞蛋、生菜等配料",
      "對切即可享用"
    ],
    tips: "即將過期的吐司做成三明治是很棒的選擇"
  },
  {
    name: "香煎雞胸肉",
    baseIngredients: ["雞胸肉", "鹽", "胡椒"],
    matchWords: ["雞胸", "雞肉"],
    description: "嫩滑香煎的蛋白質料理",
    difficulty: "簡單",
    cookingTime: "20分鐘",
    instructions: [
      "雞胸肉用鹽和胡椒醃製15分鐘",
      "平底鍋刷油，中火煎雞胸肉",
      "每面煎5-7分鐘至金黃熟透"
    ],
    tips: "可以配搭蔬菜一起享用"
  },
  {
    name: "蒜香牛肉",
    baseIngredients: ["牛肉", "蒜頭", "醬油"],
    matchWords: ["牛肉", "牛"],
    description: "香濃下飯的經典菜色",
    difficulty: "中等",
    cookingTime: "25分鐘",
    instructions: [
      "牛肉切片，用醬油醃製",
      "爆香蒜頭後下牛肉片炒至變色",
      "調味後即可起鍋"
    ],
    tips: "牛肉不要炒太久以免變老"
  },
  {
    name: "辣椒炒蛋",
    baseIngredients: ["辣椒", "雞蛋"],
    matchWords: ["辣椒", "蛋"],
    description: "香辣開胃的家常菜",
    difficulty: "簡單",
    cookingTime: "10分鐘",
    instructions: [
      "辣椒切段，雞蛋打散",
      "先炒雞蛋盛起備用",
      "爆香辣椒後加入雞蛋拌炒"
    ],
    tips: "喜歡辣一點可以加多點辣椒"
  },
  {
    name: "蘋果沙拉",
    baseIngredients: ["蘋果", "生菜"],
    matchWords: ["蘋果", "水果"],
    description: "清爽健康的水果沙拉",
    difficulty: "簡單",
    cookingTime: "5分鐘",
    instructions: [
      "蘋果洗淨切塊",
      "可搭配其他蔬菜",
      "淋上沙拉醬即可"
    ],
    tips: "蘋果切好後可淋檸檬汁防氧化"
  },
  {
    name: "火腿炒蛋",
    baseIngredients: ["火腿", "雞蛋"],
    matchWords: ["火腿", "蛋"],
    description: "經典的蛋白質組合",
    difficulty: "簡單",
    cookingTime: "8分鐘",
    instructions: [
      "火腿切丁，雞蛋打散",
      "先炒火腿至微焦",
      "倒入蛋液炒至凝固即可"
    ],
    tips: "可以加點蔥花增加香味"
  }
];

export async function generateRecipeSuggestions(foodItems: FoodItem[]): Promise<RecipeSuggestion[]> {
  try {
    // 按到期日期排序，優先考慮快過期的食材
    const sortedItems = foodItems.sort((a, b) => {
      const dateA = new Date(a.expiryDate);
      const dateB = new Date(b.expiryDate);
      return dateA.getTime() - dateB.getTime();
    });

    // 找出即將到期的食材（5天內）
    const now = new Date();
    const expiringItems = sortedItems.filter(item => {
      const expiryDate = new Date(item.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 5;
    });

    // 智能匹配食譜
    const matchedRecipes = recipeDatabase.filter(recipe => {
      return recipe.matchWords.some(word => 
        foodItems.some(item => item.name.includes(word))
      );
    }).map(recipe => {
      // 找出匹配的食材
      const matchedIngredients = foodItems.filter(item =>
        recipe.matchWords.some(word => item.name.includes(word))
      );
      
      // 找出即將到期且匹配的食材
      const matchedExpiringIngredients = expiringItems.filter(item =>
        recipe.matchWords.some(word => item.name.includes(word))
      );

      // 計算優先級
      let priority: "high" | "medium" | "low" = "medium";
      if (matchedExpiringIngredients.length > 0) {
        priority = "high";
      } else if (matchedIngredients.length >= 2) {
        priority = "medium";
      } else {
        priority = "low";
      }

      return {
        name: recipe.name,
        description: recipe.description,
        difficulty: recipe.difficulty,
        cookingTime: recipe.cookingTime,
        ingredients: [
          ...matchedIngredients.map(item => `${item.name} (來自冰箱)`),
          ...recipe.baseIngredients.filter(ing => 
            !matchedIngredients.some(item => item.name.includes(ing))
          )
        ],
        instructions: recipe.instructions,
        tips: recipe.tips,
        priority,
        expiringIngredients: matchedExpiringIngredients.map(item => item.name)
      };
    });

    // 按優先級排序
    const sortedRecipes = matchedRecipes.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // 如果沒有匹配的食譜，提供通用建議
    if (sortedRecipes.length === 0) {
      return [{
        name: "創意料理",
        description: "根據您的食材自由創作",
        difficulty: "中等",
        cookingTime: "20分鐘",
        ingredients: foodItems.map(item => item.name),
        instructions: [
          "將所有食材洗淨並準備",
          "根據食材特性決定烹調方式",
          "適當調味後即可享用"
        ],
        tips: "發揮創意，嘗試不同的搭配方式",
        priority: expiringItems.length > 0 ? "high" : "medium",
        expiringIngredients: expiringItems.map(item => item.name)
      }];
    }

    // 返回前3個最匹配的食譜
    const finalRecipes = sortedRecipes.slice(0, 3);

    // 為每個食譜生成圖片
    const recipesWithImages = await Promise.all(
      finalRecipes.map(async (recipe) => {
        try {
          if (process.env.OPENAI_API_KEY) {
            console.log(`Generating image for ${recipe.name}...`);
            const imageResponse = await openai.images.generate({
              model: "dall-e-3",
              prompt: `A beautiful, appetizing photo of ${recipe.name} (${recipe.description}). Professional food photography, well-lit, restaurant quality presentation.`,
              n: 1,
              size: "1024x1024",
              quality: "standard",
            });
            
            console.log(`Image generated successfully for ${recipe.name}`);
            return {
              ...recipe,
              imageUrl: imageResponse.data?.[0]?.url
            };
          } else {
            console.log('OpenAI API key not found, skipping image generation');
          }
        } catch (imageError) {
          console.error(`Failed to generate image for ${recipe.name}:`, imageError);
        }
        
        return recipe;
      })
    );

    return recipesWithImages;

  } catch (error) {
    console.error("Recipe generation error:", error);
    throw new Error("無法生成食譜建議，請稍後再試");
  }
}