export { NotificationManager } from './notification-manager';

export type { 
  NotificationStrategy,
  NotificationChannelType 
} from './interfaces/notification-strategy.interface';

export type { NotificationData } from './interfaces/notification-data.interface';
export type { NotificationResult } from './interfaces/notification-result.interface';

export { EmailNotificationStrategy } from './strategies/email-notification.strategy';
export { SMSNotificationStrategy } from './strategies/sms-notification.strategy';
