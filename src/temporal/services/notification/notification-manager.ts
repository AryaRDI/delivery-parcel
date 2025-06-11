import { NotificationStrategy, NotificationChannelType } from './interfaces/notification-strategy.interface';
import { NotificationData } from './interfaces/notification-data.interface';
import { NotificationResult } from './interfaces/notification-result.interface';
import { EmailNotificationStrategy } from './strategies/email-notification.strategy';
import { SMSNotificationStrategy } from './strategies/sms-notification.strategy';

export class NotificationManager {
  private strategies: Map<NotificationChannelType, NotificationStrategy> = new Map();

  constructor() {
    this.registerStrategy(new EmailNotificationStrategy());
    this.registerStrategy(new SMSNotificationStrategy());
  }

  registerStrategy(strategy: NotificationStrategy): void {
    this.strategies.set(strategy.getType(), strategy);
  }

  async sendNotification(
    channel: NotificationChannelType,
    data: NotificationData
  ): Promise<NotificationResult> {
    const strategy = this.strategies.get(channel);
    
    if (!strategy) {
      return {
        success: false,
        channel,
        recipient: data.recipient,
        error: `No strategy found for channel: ${channel}`,
        sentAt: new Date()
      };
    }

    if (!strategy.canSend()) {
      console.warn(`⚠️ ${channel.toUpperCase()} strategy not configured, skipping`);
      return {
        success: false,
        channel,
        recipient: data.recipient,
        error: `${channel.toUpperCase()} service not configured`,
        sentAt: new Date()
      };
    }

    return strategy.send(data);
  }

  async sendMultiChannelNotification(
    channels: NotificationChannelType[],
    data: NotificationData
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    
    for (const channel of channels) {
      const result = await this.sendNotification(channel, data);
      results.push(result);
    }
    
    return results;
  }

  getAvailableChannels(): NotificationChannelType[] {
    return Array.from(this.strategies.keys()).filter(channel => {
      const strategy = this.strategies.get(channel);
      return strategy?.canSend() || false;
    });
  }

  isChannelAvailable(channel: NotificationChannelType): boolean {
    const strategy = this.strategies.get(channel);
    return strategy?.canSend() || false;
  }
}
