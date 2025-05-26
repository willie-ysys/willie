import { FoodItem, InsertFoodItem, User, InsertUser, FridgeAccount, InsertFridgeAccount } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Fridge account operations
  getAllFridgeAccounts(): Promise<FridgeAccount[]>;
  getFridgeAccountById(id: number): Promise<FridgeAccount | undefined>;
  createFridgeAccount(account: InsertFridgeAccount): Promise<FridgeAccount>;
  
  // Food item operations (now with fridge account support)
  getAllFoodItems(fridgeAccountId: number): Promise<FoodItem[]>;
  getFoodItemsByCompartment(fridgeAccountId: number, compartment: string): Promise<FoodItem[]>;
  getFoodItemById(id: number): Promise<FoodItem | undefined>;
  getExpiringItems(fridgeAccountId: number, days: number): Promise<FoodItem[]>;
  createFoodItem(item: InsertFoodItem): Promise<FoodItem>;
  updateFoodItem(id: number, item: Partial<InsertFoodItem>): Promise<FoodItem | undefined>;
  deleteFoodItem(id: number): Promise<boolean>;
  getItemsCount(fridgeAccountId: number): Promise<number>;
  getExpiringItemsCount(fridgeAccountId: number, days: number): Promise<number>;
  getCategoriesCount(fridgeAccountId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private foodItems: Map<number, FoodItem>;
  private userId: number;
  private foodItemId: number;

  constructor() {
    this.users = new Map();
    this.foodItems = new Map();
    this.userId = 1;
    this.foodItemId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Food item operations
  async getAllFoodItems(): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values());
  }

  async getFoodItemsByCompartment(compartment: string): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values()).filter(
      (item) => item.compartment === compartment
    );
  }

  async getFoodItemById(id: number): Promise<FoodItem | undefined> {
    return this.foodItems.get(id);
  }

  async getExpiringItems(fridgeAccountId: number, days: number): Promise<FoodItem[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return Array.from(this.foodItems.values()).filter((item) => {
      const expiryDate = new Date(item.expiryDate);
      return item.fridgeAccountId === fridgeAccountId && expiryDate <= futureDate;
    }).sort((a, b) => {
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    });
  }

  async createFoodItem(item: InsertFoodItem): Promise<FoodItem> {
    const id = this.foodItemId++;
    const createdAt = new Date();
    const foodItem: FoodItem = { 
      ...item, 
      id, 
      createdAt,
      fridgeAccountId: item.fridgeAccountId || 1,
      imagePath: item.imagePath || null
    };
    this.foodItems.set(id, foodItem);
    return foodItem;
  }

  async updateFoodItem(id: number, item: Partial<InsertFoodItem>): Promise<FoodItem | undefined> {
    const existingItem = this.foodItems.get(id);
    if (!existingItem) return undefined;

    const updatedItem: FoodItem = { ...existingItem, ...item };
    this.foodItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteFoodItem(id: number): Promise<boolean> {
    return this.foodItems.delete(id);
  }

  async getItemsCount(fridgeAccountId: number): Promise<number> {
    return Array.from(this.foodItems.values()).filter(item => 
      item.fridgeAccountId === fridgeAccountId
    ).length;
  }

  async getExpiringItemsCount(fridgeAccountId: number, days: number): Promise<number> {
    const expiringItems = await this.getExpiringItems(fridgeAccountId, days);
    return expiringItems.length;
  }

  async getCategoriesCount(fridgeAccountId: number): Promise<number> {
    const categories = new Set<string>();
    for (const item of this.foodItems.values()) {
      if (item.fridgeAccountId === fridgeAccountId) {
        categories.add(item.category);
      }
    }
    return categories.size;
  }
}

export const storage = new MemStorage();
