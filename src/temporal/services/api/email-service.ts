import { Client, SendEmailV3_1, LibraryResponse } from 'node-mailjet';

// Initialize Mailjet with proper Client class
const mailjet = new Client({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_SECRET_KEY
});

export interface EmailNotificationOptions {
  email: string;
  message: string;
  delayMinutes: number;
  routeId: string;
  subject?: string;
  fromEmail?: string;
  fromName?: string;
}

/**
 * Email Service for sending notifications via Mailjet
 */
export class EmailService {
  /**
   * Send email notification using Mailjet
   */
  static async sendNotification(options: EmailNotificationOptions): Promise<void> {
    const {
      email,
      message,
      delayMinutes,
      routeId,
      subject,
      fromEmail = process.env.FROM_EMAIL || 'noreply@deliveryservice.com',
      fromName = 'Delivery Service'
    } = options;

    if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
      console.log('📧 Mock email sent (Mailjet not fully configured)');
      return;
    }

    try {
      const emailSubject = subject || `Delivery Update - ${delayMinutes} Minute Delay (Route ${routeId})`;
      
      const data: SendEmailV3_1.Body = {
        Messages: [
          {
            From: {
              Email: fromEmail,
              Name: fromName
            },
            To: [
              {
                Email: email,
                Name: 'Customer'
              }
            ],
            Subject: emailSubject,
            TextPart: message,
            HTMLPart: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Delivery Update</h2>
                <div style="background-color: #fff3cd; padding: 15px; border: 1px solid #ffeaa7; border-radius: 5px; margin: 20px 0;">
                  <strong>Delay Notice: ${delayMinutes} minutes</strong>
                </div>
                <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
                <hr style="margin: 30px 0;">
                <p style="font-size: 12px; color: #999;">Route ID: ${routeId}</p>
              </div>
            `
          }
        ]
      };

      const result: LibraryResponse<SendEmailV3_1.Response> = await mailjet
        .post('send', { version: 'v3.1' })
        .request(data);

      // Check the response status
      const { Status } = result.body.Messages[0];
      
      if (Status === 'success') {
        console.log('✅ Email sent via Mailjet successfully', {
          messageId: result.body.Messages[0].To[0].MessageID,
          email: result.body.Messages[0].To[0].Email,
          routeId
        });
      } else {
        console.error('❌ Mailjet email failed:', {
          status: Status,
          errors: result.body.Messages[0].Errors,
          routeId
        });
        throw new Error(`Mailjet send failed: ${Status}`);
      }
    } catch (error) {
      console.error('❌ Email service error:', error);
      throw error;
    }
  }

  /**
   * Check if email service is properly configured
   */
  static isConfigured(): boolean {
    return !!(process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY);
  }

  /**
   * Send a test email to verify configuration
   */
  static async sendTestEmail(testEmail: string): Promise<void> {
    await this.sendNotification({
      email: testEmail,
      message: 'This is a test email from the Delivery Service. Email configuration is working correctly!',
      delayMinutes: 0,
      routeId: 'TEST-001',
      subject: 'Email Service Test - Configuration Successful'
    });
  }
} 