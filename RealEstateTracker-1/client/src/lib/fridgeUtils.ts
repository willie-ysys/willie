import { FoodItem } from "@shared/schema";

// Function to calculate days until expiry
export const getDaysUntilExpiry = (expiryDate: Date | string): number => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  
  // Reset time part to compare just the dates
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Function to get text for expiry
export const getExpiryText = (expiryDate: Date | string): string => {
  const diffDays = getDaysUntilExpiry(expiryDate);
  
  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Expires today";
  if (diffDays === 1) return "Expires tomorrow";
  return `Expires in ${diffDays} days`;
};

// Function to get class for expiry status
export const getExpiryStatusClass = (expiryDate: Date | string): string => {
  const diffDays = getDaysUntilExpiry(expiryDate);
  
  if (diffDays < 0) return "text-danger bg-red-50 border-danger";
  if (diffDays === 0) return "text-danger bg-red-50 border-danger";
  if (diffDays <= 3) return "text-warning bg-yellow-50 border-warning";
  return "text-secondary bg-green-50 border-secondary";
};

// Function to sort food items by expiry date
export const sortByExpiryDate = (items: FoodItem[]): FoodItem[] => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.expiryDate);
    const dateB = new Date(b.expiryDate);
    return dateA.getTime() - dateB.getTime();
  });
};

// Function to filter food items by category
export const filterByCategory = (items: FoodItem[], category: string): FoodItem[] => {
  return items.filter(item => item.category === category);
};

// Function to get stats for food items
export const getFridgeStats = (items: FoodItem[]) => {
  const totalItems = items.length;
  
  // Count expiring items (within 3 days)
  const expiringItems = items.filter(item => {
    const diffDays = getDaysUntilExpiry(item.expiryDate);
    return diffDays >= 0 && diffDays <= 3;
  }).length;
  
  // Count unique categories
  const categories = new Set(items.map(item => item.category));
  const categoriesCount = categories.size;
  
  // Calculate space used (as a percentage of 30 items)
  const spaceUsed = Math.min(Math.round((totalItems / 30) * 100), 100);
  
  return {
    totalItems,
    expiringItems,
    categoriesCount,
    spaceUsed
  };
};
