import { EmailService } from '../../api/email-service';
import { NotificationStrategy, NotificationChannelType } from '../interfaces/notification-strategy.interface';
import { NotificationData } from '../interfaces/notification-data.interface';
import { NotificationResult } from '../interfaces/notification-result.interface';

export class EmailNotificationStrategy implements NotificationStrategy {
  canSend(): boolean {
    return EmailService.isConfigured();
  }

  async send(data: NotificationData): Promise<NotificationResult> {
    const result: NotificationResult = {
      success: false,
      channel: 'email',
      recipient: data.recipient,
      sentAt: new Date()
    };

    try {
      await EmailService.sendNotification({
        email: data.recipient,
        message: data.message,
        delayMinutes: data.delayMinutes || 0,
        routeId: data.routeId
      });

      result.success = true;
      console.log(`✅ Email notification sent to ${data.recipient}`);
      
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown email error';
      console.error(`❌ Email notification failed for ${data.recipient}:`, error);
    }

    return result;
  }

  getType(): NotificationChannelType {
    return 'email';
  }
}
