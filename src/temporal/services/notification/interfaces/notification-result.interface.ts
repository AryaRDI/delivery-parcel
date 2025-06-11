import { NotificationChannelType } from './notification-strategy.interface';

/**
 * Result structure for notification attempts
 * Contains comprehensive information about the notification delivery outcome
 */
export interface NotificationResult {
  /** Whether the notification was successfully sent */
  success: boolean;
  
  /** The channel used for this notification (email, sms, etc.) */
  channel: NotificationChannelType;
  
  /** The recipient who received (or should have received) the notification */
  recipient: string;
  
  /** Error message if the notification failed */
  error?: string;
  
  /** Timestamp when the notification attempt was made */
  sentAt: Date;
} 