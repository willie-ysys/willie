import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { foodItemSchema } from "@shared/schema";
import { checkAndSendExpiryNotifications } from "./email-notifications";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ZodError } from "zod-validation-error";

// Set up multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.resolve(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all food items
  app.get("/api/food-items", async (req: Request, res: Response) => {
    try {
      const items = await storage.getAllFoodItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food items" });
    }
  });

  // Get food items by compartment
  app.get("/api/food-items/compartment/:compartment", async (req: Request, res: Response) => {
    try {
      const compartment = req.params.compartment;
      const items = await storage.getFoodItemsByCompartment(compartment);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food items" });
    }
  });

  // Get a single food item by ID
  app.get("/api/food-items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getFoodItemById(id);
      
      if (!item) {
        return res.status(404).json({ message: "Food item not found" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food item" });
    }
  });

  // Get expiring items
  app.get("/api/food-items/expiring/:days", async (req: Request, res: Response) => {
    try {
      const days = parseInt(req.params.days);
      const fridgeAccountId = parseInt(req.query.fridgeAccountId as string) || 1;
      const items = await storage.getExpiringItems(fridgeAccountId, days);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expiring items" });
    }
  });

  // Create a new food item
  app.post("/api/food-items", async (req: Request, res: Response) => {
    try {
      console.log("Received data:", req.body);
      // 添加默認的 fridgeAccountId
      const dataWithDefaults = {
        ...req.body,
        fridgeAccountId: 1
      };
      const itemData = foodItemSchema.parse(req.body);
      console.log("Parsed data:", itemData);
      const newItem = await storage.createFoodItem(dataWithDefaults);
      res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Validation error:", error.format());
        return res.status(400).json({ 
          message: "Invalid food item data",
          errors: error.format() 
        });
      }
      console.log("General error:", error);
      res.status(500).json({ message: "Failed to create food item" });
    }
  });

  // Update a food item
  app.put("/api/food-items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const itemData = foodItemSchema.partial().parse(req.body);
      const updatedItem = await storage.updateFoodItem(id, itemData);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Food item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid food item data",
          errors: error.format() 
        });
      }
      res.status(500).json({ message: "Failed to update food item" });
    }
  });

  // Delete a food item
  app.delete("/api/food-items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteFoodItem(id);
      
      if (!success) {
        return res.status(404).json({ message: "Food item not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete food item" });
    }
  });

  // Get fridge statistics
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const fridgeAccountId = parseInt(req.query.fridgeAccountId as string) || 1;
      const totalItems = await storage.getItemsCount(fridgeAccountId);
      const expiringItems = await storage.getExpiringItemsCount(fridgeAccountId, 5); // Items expiring in next 5 days
      const categoriesCount = await storage.getCategoriesCount(fridgeAccountId);
      
      res.json({
        totalItems,
        expiringItems,
        categoriesCount,
        spaceUsed: totalItems > 0 ? Math.min(Math.round((totalItems / 30) * 100), 100) : 0, // Simple calculation for space used
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fridge statistics" });
    }
  });

  // Recipe suggestions based on available ingredients
  app.post("/api/recipe-suggestions", async (req: Request, res: Response) => {
    try {
      const foodItems = await storage.getAllFoodItems();
      
      if (foodItems.length === 0) {
        return res.json({
          suggestions: [],
          message: "冰箱裡沒有食材，無法生成食譜建議"
        });
      }

      const { generateRecipeSuggestions } = await import("./ai-recipes");
      const suggestions = await generateRecipeSuggestions(foodItems);
      
      res.json({
        suggestions,
        ingredientsCount: foodItems.length
      });
    } catch (error) {
      console.error("Recipe generation error:", error);
      res.status(500).json({ error: "Failed to generate recipe suggestions" });
    }
  });

  // Handle image upload
  app.post("/api/upload", upload.single("image"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // 使用 OpenAI GPT-4o 進行真實的圖片分析
      const { analyzeFoodImage } = await import('./ocr');
      const ocrResult = await analyzeFoodImage(req.file.path);
      
      res.json({
        success: true,
        filePath: req.file.path,
        detectedInfo: ocrResult
      });
    } catch (error) {
      console.error('OCR 處理錯誤:', error);
      res.status(500).json({ 
        message: "圖片處理失敗",
        details: error instanceof Error ? error.message : "未知錯誤"
      });
    }
  });

  // 郵件提醒 API
  app.post("/api/send-expiry-reminder", async (req: Request, res: Response) => {
    try {
      const { email, daysAhead } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "需要提供郵箱地址" });
      }

      await checkAndSendExpiryNotifications(email, daysAhead || 3);
      res.json({ success: true, message: "過期提醒已發送" });
    } catch (error) {
      console.error("發送郵件提醒錯誤:", error);
      res.status(500).json({ error: "郵件發送失敗" });
    }
  });

  // 自動檢查過期提醒 API（可用於定時任務）
  app.post("/api/auto-check-expiry", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "需要提供郵箱地址" });
      }

      // 檢查未來3天內到期的食品
      await checkAndSendExpiryNotifications(email, 3);
      res.json({ success: true, message: "自動檢查完成" });
    } catch (error) {
      console.error("自動檢查錯誤:", error);
      res.status(500).json({ error: "自動檢查失敗" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
