import { OpenAIService } from '../services/api/openai-service';
import { GoogleRoutesService } from '../services/api/google-routes-service';
import { NotificationManager, type NotificationResult } from '../services/notification';
import { 
  TrafficMonitoringActivities, 
  DeliveryRoute, 
  TrafficData, 
  DelayNotification
} from '../types';

export const trafficMonitoringActivities: TrafficMonitoringActivities = {
  
  async fetchTrafficData(route: DeliveryRoute): Promise<TrafficData> {
    return GoogleRoutesService.fetchTrafficData(route);
  },

  async generateDelayMessage(
    routeId: string, 
    delayMinutes: number, 
    messageType: 'email' | 'sms' = 'email'
  ): Promise<string> {
    return OpenAIService.generateDelayMessage({
      routeId,
      delayMinutes,
      messageType
    });
  },

  async sendDelayNotification(
    route: DeliveryRoute, 
    trafficData: TrafficData
  ): Promise<DelayNotification> {
    console.log(`📬 Sending delay notification for route ${route.routeId}`);
    
    const notification: DelayNotification = {
      routeId: route.routeId,
      delayMinutes: trafficData.delayMinutes,
      message: '',
      sentAt: new Date(),
      notificationType: route.customerPhone ? 'both' : 'email',
      success: false
    };

    try {
      const notificationManager = new NotificationManager();
      const notificationResults: NotificationResult[] = [];
      let primaryMessage = '';

      // Determine which channels to use
      const channels: Array<'email' | 'sms'> = [];
      if (route.customerEmail) channels.push('email');
      if (route.customerPhone) channels.push('sms');

      console.log(`📡 Available channels: ${channels.join(', ')}`);
      console.log(`🔧 Configured channels: ${notificationManager.getAvailableChannels().join(', ')}`);

      // Send notifications for each channel
      for (const channel of channels) {
        // Generate appropriate message for the channel
        const message = await trafficMonitoringActivities.generateDelayMessage(
          route.routeId,
          trafficData.delayMinutes,
          channel
        );

        // Determine recipient based on channel
        const recipient = channel === 'email' ? route.customerEmail! : route.customerPhone!;

        // Send notification using strategy pattern
        const result = await notificationManager.sendNotification(channel, {
          routeId: route.routeId,
          message,
          recipient,
          delayMinutes: trafficData.delayMinutes
        });

        notificationResults.push(result);

        if (channel === 'email') {
          primaryMessage = message;
        }
      }

      const hasSuccessfulNotification = notificationResults.some(result => result.success);
      const allNotificationsFailed = notificationResults.length > 0 && notificationResults.every(result => !result.success);

      notification.success = hasSuccessfulNotification;
      notification.message = primaryMessage || 'No email message generated';

      // Log results
      console.log(`📊 Notification Results:`, {
        routeId: route.routeId,
        totalSent: notificationResults.length,
        successful: notificationResults.filter(r => r.success).length,
        channels: notificationResults.map(r => `${r.channel}: ${r.success ? '✅' : '❌'}`).join(', ')
      });

      if (allNotificationsFailed) {
        const errors = notificationResults.map(r => `${r.channel}: ${r.error}`).join('; ');
        notification.error = `All notifications failed: ${errors}`;
        console.error(`❌ All notifications failed for route ${route.routeId}`);
      } else if (hasSuccessfulNotification) {
        console.log(`✅ Notification sent successfully for route ${route.routeId}`);
      }

    } catch (error) {
      console.error('❌ Error in notification process:', error);
      notification.success = false;
      notification.error = error instanceof Error ? error.message : 'Unknown notification error';
    }

    return notification;
  },

  async logTrafficEvent(routeId: string, event: string, details?: any): Promise<void> {
    const timestamp = new Date().toISOString();
    console.log(`📝 [${timestamp}] Route ${routeId} - ${event}`, details || '');
  }
};
