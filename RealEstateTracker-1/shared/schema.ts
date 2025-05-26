import { pgTable, text, serial, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the compartment enum
export const CompartmentEnum = z.enum([
  "頂層架",
  "中層架1",
  "中層架2",
  "中層架3",
  "底層架",
  "蔬果盒",
  "左門頂層",
  "左門上層",
  "左門下層",
  "左門底層",
  "右門頂層",
  "右門上層",
  "右門下層",
  "右門底層"
]);

export type Compartment = z.infer<typeof CompartmentEnum>;

// Category enum for food items
export const CategoryEnum = z.enum([
  "乳製品",
  "肉類",
  "蔬菜水果",
  "飲料",
  "調味料",
  "剩菜",
  "零食",
  "其他"
]);

export type Category = z.infer<typeof CategoryEnum>;

// 冰箱帳號表
export const fridgeAccounts = pgTable("fridge_accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define the food item table
export const foodItems = pgTable("food_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  expiryDate: date("expiry_date").notNull(),
  compartment: text("compartment").notNull(),
  imagePath: text("image_path"),
  fridgeAccountId: integer("fridge_account_id").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define the insert schema
export const insertFoodItemSchema = createInsertSchema(foodItems).omit({
  id: true,
  createdAt: true,
});

// Schema validation for food item
export const foodItemSchema = z.object({
  name: z.string().min(1, "食品名稱不能為空"),
  category: CategoryEnum,
  compartment: CompartmentEnum,
  expiryDate: z.string(),
  imagePath: z.string().optional(),
});

// 冰箱帳號相關的 schema
export const insertFridgeAccountSchema = createInsertSchema(fridgeAccounts).omit({
  id: true,
  createdAt: true,
});

export const fridgeAccountSchema = insertFridgeAccountSchema.extend({
  name: z.string().min(1, "冰箱名稱不能為空"),
});

// Type definitions
export type InsertFoodItem = z.infer<typeof foodItemSchema>;
export type FoodItem = typeof foodItems.$inferSelect;
export type InsertFridgeAccount = z.infer<typeof fridgeAccountSchema>;
export type FridgeAccount = typeof fridgeAccounts.$inferSelect;

// Users schema for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
