// Shared types for Temporal workflows and activities

// Route and Traffic Data interfaces
export interface DeliveryRoute {
  routeId: string;
  origin: string;
  destination: string;
  estimatedDurationMinutes: number;
  customerEmail: string;
  customerPhone?: string;
  delayThresholdMinutes: number;
}

export interface TrafficData {
  routeId: string;
  currentDurationMinutes: number;
  estimatedDurationMinutes: number;
  delayMinutes: number;
  trafficCondition: 'light' | 'moderate' | 'heavy' | 'severe';
  source: string;
  lastUpdated: Date;
}

export interface DelayNotification {
  routeId: string;
  success: boolean;
  delayMinutes: number;
  message: string;
  sentAt: Date;
  notificationType: 'email' | 'sms' | 'both';
  messageLength?: number;
  error?: string;
}

export interface TrafficMonitoringResult {
  routeId: string;
  finalDelayMinutes: number;
  notificationSent: boolean;
  notificationDetails?: DelayNotification;
  monitoringCompleted: boolean;
}

// Activity interfaces for traffic monitoring
export interface TrafficMonitoringActivities {
  fetchTrafficData(route: DeliveryRoute): Promise<TrafficData>;
  generateDelayMessage(routeId: string, delayMinutes: number, messageType: 'email' | 'sms'): Promise<string>;
  sendDelayNotification(route: DeliveryRoute, trafficData: TrafficData): Promise<DelayNotification>;
  logTrafficEvent(routeId: string, event: string, details?: any): Promise<void>;
}

// Workflow interface
export interface TrafficMonitoringWorkflow {
  (route: DeliveryRoute): Promise<TrafficMonitoringResult>;
}

// Additional types for API integrations
export interface OpenAIRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface EmailNotificationPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface SMSNotificationPayload {
  to: string;
  body: string;
} 