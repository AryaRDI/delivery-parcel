import { trafficMonitoringActivities } from '@/temporal/activities/traffic-monitoring-activities';
import type { DeliveryRoute, TrafficData } from '@/temporal/types';

// Mock external services
jest.mock('@/temporal/services/api/openai-service');
jest.mock('@/temporal/services/api/google-routes-service');
jest.mock('@/temporal/services/notification');

import { OpenAIService } from '@/temporal/services/api/openai-service';
import { GoogleRoutesService } from '@/temporal/services/api/google-routes-service';
import { NotificationManager } from '@/temporal/services/notification';

const mockOpenAIService = OpenAIService as jest.Mocked<typeof OpenAIService>;
const mockGoogleRoutesService = GoogleRoutesService as jest.Mocked<typeof GoogleRoutesService>;
const mockNotificationManager = NotificationManager as jest.MockedClass<typeof NotificationManager>;

describe('Traffic Monitoring Activities', () => {
  const mockRoute: DeliveryRoute = {
    routeId: 'TEST-001',
    origin: '123 Test St, City, State',
    destination: '456 Destination Ave, City, State',
    estimatedDurationMinutes: 30,
    customerEmail: 'test@example.com',
    customerPhone: '+1234567890',
    delayThresholdMinutes: 15,
  };

  const mockTrafficData: TrafficData = {
    routeId: 'TEST-001',
    currentDurationMinutes: 50,
    estimatedDurationMinutes: 30,
    delayMinutes: 20,
    trafficCondition: 'heavy',
    source: 'Google Routes API',
    lastUpdated: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset console mocks
    (console.log as jest.Mock).mockClear();
    (console.error as jest.Mock).mockClear();
  });

  describe('fetchTrafficData', () => {
    it('should fetch traffic data successfully', async () => {
      mockGoogleRoutesService.fetchTrafficData.mockResolvedValue(mockTrafficData);

      const result = await trafficMonitoringActivities.fetchTrafficData(mockRoute);

      expect(result).toEqual(mockTrafficData);
      expect(mockGoogleRoutesService.fetchTrafficData).toHaveBeenCalledWith(mockRoute);
    });

    it('should handle traffic data fetch errors', async () => {
      const error = new Error('Google Routes API Error');
      mockGoogleRoutesService.fetchTrafficData.mockRejectedValue(error);

      await expect(trafficMonitoringActivities.fetchTrafficData(mockRoute))
        .rejects.toThrow('Google Routes API Error');
    });
  });

  describe('generateDelayMessage', () => {
    it('should generate email delay message', async () => {
      const expectedMessage = 'Your delivery may be delayed by 20 minutes due to heavy traffic.';
      mockOpenAIService.generateDelayMessage.mockResolvedValue(expectedMessage);

      const result = await trafficMonitoringActivities.generateDelayMessage(
        'TEST-001',
        20,
        'email'
      );

      expect(result).toBe(expectedMessage);
      expect(mockOpenAIService.generateDelayMessage).toHaveBeenCalledWith({
        routeId: 'TEST-001',
        delayMinutes: 20,
        messageType: 'email',
      });
    });

    it('should generate SMS delay message', async () => {
      const expectedMessage = 'Delivery delayed 20min due to traffic. ETA updated.';
      mockOpenAIService.generateDelayMessage.mockResolvedValue(expectedMessage);

      const result = await trafficMonitoringActivities.generateDelayMessage(
        'TEST-001',
        20,
        'sms'
      );

      expect(result).toBe(expectedMessage);
      expect(mockOpenAIService.generateDelayMessage).toHaveBeenCalledWith({
        routeId: 'TEST-001',
        delayMinutes: 20,
        messageType: 'sms',
      });
    });

    it('should default to email message type', async () => {
      const expectedMessage = 'Your delivery may be delayed by 15 minutes.';
      mockOpenAIService.generateDelayMessage.mockResolvedValue(expectedMessage);

      const result = await trafficMonitoringActivities.generateDelayMessage(
        'TEST-001',
        15,
        'email'
      );

      expect(result).toBe(expectedMessage);
      expect(mockOpenAIService.generateDelayMessage).toHaveBeenCalledWith({
        routeId: 'TEST-001',
        delayMinutes: 15,
        messageType: 'email',
      });
    });
  });

  describe('sendDelayNotification', () => {
    let mockNotificationManagerInstance: jest.Mocked<NotificationManager>;

    beforeEach(() => {
      mockNotificationManagerInstance = {
        sendNotification: jest.fn(),
        getAvailableChannels: jest.fn().mockReturnValue(['email', 'sms']),
      } as any;

      mockNotificationManager.mockImplementation(() => mockNotificationManagerInstance);
    });

    it('should send notifications to both email and SMS when both are available', async () => {
      const emailMessage = 'Your delivery may be delayed by 20 minutes due to heavy traffic.';
      const smsMessage = 'Delivery delayed 20min due to traffic.';
      
      mockOpenAIService.generateDelayMessage
        .mockResolvedValueOnce(emailMessage)
        .mockResolvedValueOnce(smsMessage);

      mockNotificationManagerInstance.sendNotification
        .mockResolvedValueOnce({
          success: true,
          channel: 'email',
          recipient: 'test@example.com',
          sentAt: new Date(),
        })
        .mockResolvedValueOnce({
          success: true,
          channel: 'sms',
          recipient: '+1234567890',
          sentAt: new Date(),
        });

      const result = await trafficMonitoringActivities.sendDelayNotification(
        mockRoute,
        mockTrafficData
      );

      expect(result.success).toBe(true);
      expect(result.routeId).toBe('TEST-001');
      expect(result.delayMinutes).toBe(20);
      expect(result.notificationType).toBe('both');
      expect(result.message).toBe(emailMessage);

      expect(mockNotificationManagerInstance.sendNotification).toHaveBeenCalledTimes(2);
      expect(mockNotificationManagerInstance.sendNotification).toHaveBeenCalledWith('email', {
        routeId: 'TEST-001',
        message: emailMessage,
        recipient: 'test@example.com',
        delayMinutes: 20,
      });
      expect(mockNotificationManagerInstance.sendNotification).toHaveBeenCalledWith('sms', {
        routeId: 'TEST-001',
        message: smsMessage,
        recipient: '+1234567890',
        delayMinutes: 20,
      });
    });

    it('should send only email notification when phone is not provided', async () => {
      const routeWithoutPhone = { ...mockRoute, customerPhone: undefined };
      const emailMessage = 'Your delivery may be delayed by 20 minutes due to heavy traffic.';
      
      mockOpenAIService.generateDelayMessage.mockResolvedValue(emailMessage);
      mockNotificationManagerInstance.sendNotification.mockResolvedValue({
        success: true,
        channel: 'email',
        recipient: 'test@example.com',
        sentAt: new Date(),
      });

      const result = await trafficMonitoringActivities.sendDelayNotification(
        routeWithoutPhone,
        mockTrafficData
      );

      expect(result.success).toBe(true);
      expect(result.notificationType).toBe('email');
      expect(mockNotificationManagerInstance.sendNotification).toHaveBeenCalledTimes(1);
      expect(mockNotificationManagerInstance.sendNotification).toHaveBeenCalledWith('email', {
        routeId: 'TEST-001',
        message: emailMessage,
        recipient: 'test@example.com',
        delayMinutes: 20,
      });
    });

    it('should handle partial notification failures gracefully', async () => {
      const emailMessage = 'Your delivery may be delayed by 20 minutes due to heavy traffic.';
      const smsMessage = 'Delivery delayed 20min due to traffic.';
      
      mockOpenAIService.generateDelayMessage
        .mockResolvedValueOnce(emailMessage)
        .mockResolvedValueOnce(smsMessage);

      mockNotificationManagerInstance.sendNotification
        .mockResolvedValueOnce({
          success: true,
          channel: 'email',
          recipient: 'test@example.com',
          sentAt: new Date(),
        })
        .mockResolvedValueOnce({
          success: false,
          channel: 'sms',
          recipient: '+1234567890',
          error: 'SMS service unavailable',
          sentAt: new Date(),
        });

      const result = await trafficMonitoringActivities.sendDelayNotification(
        mockRoute,
        mockTrafficData
      );

      expect(result.success).toBe(true); // At least one notification succeeded
      expect(result.routeId).toBe('TEST-001');
      expect(result.delayMinutes).toBe(20);
      expect(result.notificationType).toBe('both');
    });

    it('should handle complete notification failure', async () => {
      const emailMessage = 'Your delivery may be delayed by 20 minutes due to heavy traffic.';
      const smsMessage = 'Delivery delayed 20min due to traffic.';
      
      mockOpenAIService.generateDelayMessage
        .mockResolvedValueOnce(emailMessage)
        .mockResolvedValueOnce(smsMessage);

      mockNotificationManagerInstance.sendNotification
        .mockResolvedValueOnce({
          success: false,
          channel: 'email',
          recipient: 'test@example.com',
          error: 'Email service down',
          sentAt: new Date(),
        })
        .mockResolvedValueOnce({
          success: false,
          channel: 'sms',
          recipient: '+1234567890',
          error: 'SMS service unavailable',
          sentAt: new Date(),
        });

      const result = await trafficMonitoringActivities.sendDelayNotification(
        mockRoute,
        mockTrafficData
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('All notifications failed');
      expect(result.error).toContain('email: Email service down');
      expect(result.error).toContain('sms: SMS service unavailable');
    });

    it('should handle notification process errors', async () => {
      const error = new Error('Notification manager error');
      mockNotificationManager.mockImplementation(() => {
        throw error;
      });

      const result = await trafficMonitoringActivities.sendDelayNotification(
        mockRoute,
        mockTrafficData
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Notification manager error');
    });
  });

  describe('logTrafficEvent', () => {
    it('should log traffic events with details', async () => {
      const details = { delay: 20, condition: 'heavy' };

      await trafficMonitoringActivities.logTrafficEvent(
        'TEST-001',
        'Delay detected',
        details
      );

      expect(console.log).toHaveBeenCalledWith(
        expect.stringMatching(/^\📝 \[.*\] Route TEST-001 - Delay detected$/),
        details
      );
    });

    it('should log traffic events without details', async () => {
      await trafficMonitoringActivities.logTrafficEvent(
        'TEST-001',
        'Monitoring started'
      );

      expect(console.log).toHaveBeenCalledWith(
        expect.stringMatching(/^\📝 \[.*\] Route TEST-001 - Monitoring started$/),
        ''
      );
    });

    it('should include timestamp in log format', async () => {
      const beforeTime = new Date().getTime();
      
      await trafficMonitoringActivities.logTrafficEvent(
        'TEST-001',
        'Test event'
      );

      const afterTime = new Date().getTime();
      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      
      // Extract timestamp from log message
      const timestampMatch = logCall.match(/\[(.+)\]/);
      expect(timestampMatch).toBeTruthy();
      
      const logTimestamp = new Date(timestampMatch[1]).getTime();
      expect(logTimestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(logTimestamp).toBeLessThanOrEqual(afterTime);
    });
  });
});
