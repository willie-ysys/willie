import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { FoodItem } from '@shared/schema';

const NotificationManager: React.FC = () => {
  const { data: foodItems = [] } = useQuery<FoodItem[]>({
    queryKey: ['/api/food-items'],
  });

  // 請求通知權限
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('瀏覽器通知權限已獲得');
        }
      });
    }
  }, []);

  // 檢查過期食品並發送通知
  useEffect(() => {
    if (!foodItems.length) return;

    const checkExpiringItems = () => {
      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);

      const expiringItems = foodItems.filter(item => {
        const expiryDate = new Date(item.expiryDate);
        return expiryDate <= threeDaysFromNow;
      });

      if (expiringItems.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
        // 避免重複通知，使用 localStorage 記錄
        const lastNotificationKey = 'lastExpiryNotification';
        const lastNotification = localStorage.getItem(lastNotificationKey);
        const now = new Date().toDateString();

        if (lastNotification !== now) {
          const urgentItems = expiringItems.filter(item => {
            const daysUntilExpiry = Math.ceil(
              (new Date(item.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );
            return daysUntilExpiry <= 1;
          });

          if (urgentItems.length > 0) {
            new Notification('🚨 智能冰箱提醒：食品即將過期！', {
              body: `您有 ${urgentItems.length} 項食品即將過期或已過期，請盡快處理。`,
              icon: '/favicon.ico',
              tag: 'expiry-reminder',
              requireInteraction: true
            });

            localStorage.setItem(lastNotificationKey, now);
          }
        }
      }
    };

    // 立即檢查一次
    checkExpiringItems();

    // 每小時檢查一次
    const interval = setInterval(checkExpiringItems, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [foodItems]);

  return null; // 這是一個隱藏的組件
};

export default NotificationManager;