import { storage } from "./storage";
import type { FoodItem } from "@shared/schema";
import nodemailer from 'nodemailer';

export interface EmailNotificationService {
  sendExpiryReminder(email: string, expiringItems: FoodItem[]): Promise<boolean>;
}

// Gmail SMTP 實現 (推薦)
export class GmailEmailService implements EmailNotificationService {
  private user: string;
  private pass: string;

  constructor(user: string, pass: string) {
    this.user = user;
    this.pass = pass;
  }

  async sendExpiryReminder(email: string, expiringItems: FoodItem[]): Promise<boolean> {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.user,
          pass: this.pass
        }
      });

      const itemsList = expiringItems.map(item => {
        const daysUntilExpiry = Math.ceil(
          (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return `• ${item.name} (${item.compartment}) - ${daysUntilExpiry <= 0 ? '已過期' : `${daysUntilExpiry}天後過期`}`;
      }).join('\n');

      const mailOptions = {
        from: this.user,
        to: email,
        subject: '🚨 智能冰箱提醒：食品即將過期',
        text: `您好！\n\n您的冰箱中有 ${expiringItems.length} 項食品即將過期或已過期：\n\n${itemsList}\n\n請盡快處理這些食品，避免浪費。\n\n智能冰箱管理系統`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🚨 食品過期提醒</h1>
            </div>
            
            <div style="background-color: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">您好！</p>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 6px;">
                <p style="font-size: 16px; color: #dc2626; margin: 0;">
                  您的冰箱中有 <strong>${expiringItems.length}</strong> 項食品即將過期或已過期
                </p>
              </div>

              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #374151; margin-top: 0;">需要處理的食品：</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  ${expiringItems.map(item => {
                    const daysUntilExpiry = Math.ceil(
                      (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    const urgencyColor = daysUntilExpiry <= 0 ? '#dc2626' : daysUntilExpiry <= 1 ? '#ea580c' : '#f59e0b';
                    return `<li style="color: ${urgencyColor}; margin: 8px 0; font-weight: 500;">
                      <strong>${item.name}</strong> (${item.compartment}) - 
                      ${daysUntilExpiry <= 0 ? '已過期' : `${daysUntilExpiry}天後過期`}
                    </li>`;
                  }).join('')}
                </ul>
              </div>

              <p style="font-size: 16px; color: #374151; margin: 20px 0;">請盡快處理這些食品，避免浪費。</p>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  此郵件由智能冰箱管理系統自動發送
                </p>
              </div>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Gmail 過期提醒郵件已發送至:', email);
      return true;
    } catch (error) {
      console.error('Gmail 郵件發送失敗:', error);
      return false;
    }
  }
}

// SendGrid 實現
export class SendGridEmailService implements EmailNotificationService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendExpiryReminder(email: string, expiringItems: FoodItem[]): Promise<boolean> {
    try {
      const sgMail = await import('@sendgrid/mail');
      sgMail.default.setApiKey(this.apiKey);

      const itemsList = expiringItems.map(item => {
        const daysUntilExpiry = Math.ceil(
          (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return `• ${item.name} (${item.compartment}) - ${daysUntilExpiry <= 0 ? '已過期' : `${daysUntilExpiry}天後過期`}`;
      }).join('\n');

      const msg = {
        to: email,
        from: 'noreply@smartfridge.com', // 需要是已驗證的發送者郵箱
        subject: '🚨 智能冰箱提醒：食品即將過期',
        text: `您好！\n\n您的冰箱中有 ${expiringItems.length} 項食品即將過期或已過期：\n\n${itemsList}\n\n請盡快處理這些食品，避免浪費。\n\n智能冰箱管理系統`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ef4444;">🚨 食品過期提醒</h2>
            <p>您好！</p>
            <p>您的冰箱中有 <strong>${expiringItems.length}</strong> 項食品即將過期或已過期：</p>
            <ul style="background-color: #fef2f2; padding: 15px; border-radius: 8px;">
              ${expiringItems.map(item => {
                const daysUntilExpiry = Math.ceil(
                  (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                const urgencyColor = daysUntilExpiry <= 0 ? '#dc2626' : daysUntilExpiry <= 1 ? '#ea580c' : '#f59e0b';
                return `<li style="color: ${urgencyColor}; margin: 5px 0;"><strong>${item.name}</strong> (${item.compartment}) - ${daysUntilExpiry <= 0 ? '已過期' : `${daysUntilExpiry}天後過期`}</li>`;
              }).join('')}
            </ul>
            <p>請盡快處理這些食品，避免浪費。</p>
            <p style="color: #6b7280; font-size: 14px;">智能冰箱管理系統</p>
          </div>
        `,
      };

      await sgMail.default.send(msg);
      console.log('過期提醒郵件已發送至:', email);
      return true;
    } catch (error) {
      console.error('SendGrid 郵件發送失敗:', error);
      return false;
    }
  }
}

// 瀏覽器通知實現（作為備用方案）
export class BrowserNotificationService implements EmailNotificationService {
  async sendExpiryReminder(email: string, expiringItems: FoodItem[]): Promise<boolean> {
    try {
      // 這個會在前端觸發瀏覽器通知
      console.log('準備發送瀏覽器通知給:', email);
      console.log('過期食品:', expiringItems);
      return true;
    } catch (error) {
      console.error('瀏覽器通知失敗:', error);
      return false;
    }
  }
}

// 控制台日誌實現（開發用）
export class ConsoleLogService implements EmailNotificationService {
  async sendExpiryReminder(email: string, expiringItems: FoodItem[]): Promise<boolean> {
    console.log('\n=== 食品過期提醒 ===');
    console.log(`收件人: ${email}`);
    console.log(`過期食品數量: ${expiringItems.length}`);
    expiringItems.forEach(item => {
      const daysUntilExpiry = Math.ceil(
        (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      console.log(`- ${item.name} (${item.compartment}): ${daysUntilExpiry <= 0 ? '已過期' : `${daysUntilExpiry}天後過期`}`);
    });
    console.log('==================\n');
    return true;
  }
}

// 工廠函數：根據可用配置選擇合適的郵件服務
export function createEmailService(): EmailNotificationService {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  
  if (gmailUser && gmailPass) {
    console.log('使用 Gmail SMTP 郵件服務');
    return new GmailEmailService(gmailUser, gmailPass);
  } else if (sendgridApiKey) {
    console.log('使用 SendGrid 郵件服務');
    return new SendGridEmailService(sendgridApiKey);
  } else {
    console.log('未設定郵件服務，使用控制台日誌模式');
    return new ConsoleLogService();
  }
}

// 檢查過期食品並發送提醒
export async function checkAndSendExpiryNotifications(
  userEmail: string, 
  daysAhead: number = 3
): Promise<void> {
  try {
    const expiringItems = await storage.getExpiringItems(daysAhead);
    
    if (expiringItems.length > 0) {
      const emailService = createEmailService();
      const success = await emailService.sendExpiryReminder(userEmail, expiringItems);
      
      if (success) {
        console.log(`成功發送過期提醒給 ${userEmail}，共 ${expiringItems.length} 項食品`);
      } else {
        console.error(`郵件發送失敗給 ${userEmail}`);
      }
    } else {
      console.log('沒有即將過期的食品，無需發送提醒');
    }
  } catch (error) {
    console.error('檢查過期食品時發生錯誤:', error);
  }
}