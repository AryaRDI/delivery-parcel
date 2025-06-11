/**
 * Common data structure for all notification types
 * Contains all necessary information to send a notification
 */
export interface NotificationData {
  /** Unique identifier for the route being monitored */
  routeId: string;
  
  /** The notification message content */
  message: string;
  
  /** Recipient contact (email address or phone number) */
  recipient: string;
  
  /** Delay duration in minutes (optional, for context) */
  delayMinutes?: number;
} 