import { SMSService } from '../../api/sms-service';
import { NotificationStrategy, NotificationChannelType } from '../interfaces/notification-strategy.interface';
import { NotificationData } from '../interfaces/notification-data.interface';
import { NotificationResult } from '../interfaces/notification-result.interface';

export class SMSNotificationStrategy implements NotificationStrategy {
  canSend(): boolean {
    return SMSService.isConfigured();
  }

  async send(data: NotificationData): Promise<NotificationResult> {
    const result: NotificationResult = {
      success: false,
      channel: 'sms',
      recipient: data.recipient,
      sentAt: new Date()
    };

    try {
      await SMSService.sendNotification({
        phoneNumber: data.recipient,
        message: data.message,
        routeId: data.routeId
      });

      result.success = true;
      console.log(`✅ SMS notification sent to ${data.recipient}`);
      
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown SMS error';
      console.error(`❌ SMS notification failed for ${data.recipient}:`, error);
    }

    return result;
  }

  getType(): NotificationChannelType {
    return 'sms';
  }
}
