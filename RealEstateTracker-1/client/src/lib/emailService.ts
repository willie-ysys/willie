import emailjs from '@emailjs/browser';
import type { FoodItem } from '@shared/schema';

export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export class EmailJSService {
  private config: EmailJSConfig;

  constructor(config: EmailJSConfig) {
    this.config = config;
    emailjs.init(this.config.publicKey);
  }

  async sendExpiryReminder(toEmail: string, expiringItems: FoodItem[]): Promise<boolean> {
    try {
      const itemsList = expiringItems.map(item => {
        const daysUntilExpiry = Math.ceil(
          (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return `• ${item.name} (${item.compartment}) - ${daysUntilExpiry <= 0 ? '已過期' : `${daysUntilExpiry}天後過期`}`;
      }).join('\n');

      const templateParams = {
        to_email: toEmail,
        to_name: '親愛的用戶',
        from_name: '智能冰箱管理系統',
        subject: '🚨 食品過期提醒',
        message: `您好！

您的冰箱中有 ${expiringItems.length} 項食品即將過期或已過期：

${itemsList}

請盡快處理這些食品，避免浪費。

智能冰箱管理系統`,
        items_count: expiringItems.length,
        items_list: itemsList
      };

      const response = await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams
      );

      console.log('EmailJS 郵件發送成功:', response.status, response.text);
      return true;
    } catch (error) {
      console.error('EmailJS 郵件發送失敗:', error);
      return false;
    }
  }
}

// 創建 EmailJS 服務實例
export function createEmailJSService(): EmailJSService | null {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (serviceId && templateId && publicKey) {
    return new EmailJSService({ serviceId, templateId, publicKey });
  } else {
    console.log('EmailJS 配置未完成，請設定環境變數');
    return null;
  }
}