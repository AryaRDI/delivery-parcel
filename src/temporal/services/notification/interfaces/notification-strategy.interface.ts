import { NotificationData } from './notification-data.interface';
import { NotificationResult } from './notification-result.interface';

export type NotificationChannelType = 'email' | 'sms';

/**
 * Strategy interface following Interface Segregation Principle
 * Defines the contract for all notification strategies
 */
export interface NotificationStrategy {
  /**
   * Check if this notification strategy is properly configured and can send notifications
   */
  canSend(): boolean;

  /**
   * Send notification using this strategy
   */
  send(data: NotificationData): Promise<NotificationResult>;

  /**
   * Get the type of notification channel this strategy handles
   */
  getType(): NotificationChannelType;
} 