import twilio, { Twilio } from 'twilio';

// Initialize Twilio client
let twilioClient: Twilio | null = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export interface SMSNotificationOptions {
  phoneNumber: string;
  message: string;
  routeId: string;
  fromNumber?: string;
}

/**
 * SMS Service for sending notifications via Twilio
 */
export class SMSService {
  /**
   * Send SMS notification using Twilio
   */
  static async sendNotification(options: SMSNotificationOptions): Promise<void> {
    const {
      phoneNumber,
      message,
      routeId,
      fromNumber = process.env.TWILIO_PHONE_NUMBER
    } = options;

    if (!twilioClient) {
      console.log('📱 Mock SMS sent (Twilio not configured)');
      return;
    }

    if (!fromNumber) {
      console.warn('⚠️ Twilio phone number not configured, using mock SMS');
      console.log('📱 Mock SMS sent');
      return;
    }

    try {
      // Message is already optimized for SMS length by AI
      const smsBody = `Delivery Update (${routeId}): ${message}`;
      
      const response = await twilioClient.messages.create({
        body: smsBody,
        from: fromNumber,
        to: phoneNumber
      });

      console.log('✅ SMS sent via Twilio successfully', {
        messageSid: response.sid,
        phoneNumber: phoneNumber.replace(/\d(?=\d{4})/g, '*'), // Mask phone number for privacy
        routeId,
        status: response.status
      });

    } catch (error) {
      console.error('❌ SMS service error:', error);
      throw error;
    }
  }

  /**
   * Check if SMS service is properly configured
   */
  static isConfigured(): boolean {
    return !!(
      process.env.TWILIO_ACCOUNT_SID && 
      process.env.TWILIO_AUTH_TOKEN && 
      process.env.TWILIO_PHONE_NUMBER &&
      twilioClient
    );
  }

  /**
   * Send a test SMS to verify configuration
   */
  static async sendTestSMS(testPhoneNumber: string): Promise<void> {
    await this.sendNotification({
      phoneNumber: testPhoneNumber,
      message: 'This is a test SMS from the Delivery Service. SMS configuration is working correctly!',
      routeId: 'TEST-001'
    });
  }

  /**
   * Validate phone number format (basic validation)
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation - should start with + and contain only digits
    const phoneRegex = /^\+\d{10,15}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Format phone number for display (masking for privacy)
   */
  static formatPhoneForDisplay(phoneNumber: string): string {
    return phoneNumber.replace(/\d(?=\d{4})/g, '*');
  }

  /**
   * Get the current Twilio client status
   */
  static getClientStatus(): {
    configured: boolean;
    accountSid?: string;
    phoneNumber?: string;
  } {
    return {
      configured: this.isConfigured(),
      accountSid: process.env.TWILIO_ACCOUNT_SID ? 
        process.env.TWILIO_ACCOUNT_SID.substring(0, 8) + '...' : undefined,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER ? 
        this.formatPhoneForDisplay(process.env.TWILIO_PHONE_NUMBER) : undefined
    };
  }
} 