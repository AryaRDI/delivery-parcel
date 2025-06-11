# Traffic Delay Monitoring & Notification System

A full-stack application built with **Temporal.io**, **Next.js**, and **TypeScript** for monitoring traffic delays on freight delivery routes and notifying customers when significant delays occur.

## 🎯 Overview

This system demonstrates:
1. **Real-time traffic monitoring** using Google Routes API
2. **AI-powered notifications** with OpenAI GPT-4o-mini
3. **Multi-channel delivery** via email (Mailjet) and SMS (Twilio)
4. **Strategy pattern implementation** following SOLID principles
5. **Comprehensive error handling** with graceful fallbacks

## 🏗️ Architecture

### Project Structure
```
src/
├── app/                           # Next.js App Router
│   ├── page.tsx                  # Traffic monitoring UI
│   ├── components/               # React components
│   └── api/traffic/              # API endpoints
├── temporal/                     # Temporal-specific code
│   ├── activities/              # Business logic
│   ├── workflows/               # Workflow definitions
│   ├── workers/                 # Worker processes
│   └── services/                # External integrations
│       ├── api/                 # API service classes
│       │   ├── email-service.ts
│       │   ├── sms-service.ts
│       │   ├── openai-service.ts
│       │   └── google-routes-service.ts
│       └── notification/        # Strategy pattern implementation
│           ├── interfaces/      # TypeScript contracts
│           ├── strategies/      # Notification strategies
│           └── notification-manager.ts
```

### Notification Strategy Pattern
The notification system follows the **Strategy Pattern** with SOLID principles:

```
NotificationManager (Context)
      ↓ uses
NotificationStrategy (Interface)
      ↑ implements
┌─────────────────┬─────────────────┐
│ EmailStrategy   │ SMSStrategy     │
└─────────────────┴─────────────────┘
```

**Benefits**:
- ✅ Easy to add new channels (Slack, Push, etc.)
- ✅ Each strategy is independently testable
- ✅ Follows all SOLID principles
- ✅ Clean separation of concerns

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Temporal CLI

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp env.template .env.local
# Edit .env.local with your API keys

# 3. Start Temporal server
npm run temporal:server

# 4. Start worker (new terminal)
npm run dev:worker

# 5. Start Next.js app (new terminal)
npm run dev
```

### Environment Variables
```env
# Required
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_SECRET_KEY=your_mailjet_secret_key
FROM_EMAIL=noreply@yourdeliveryservice.com

# Optional
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## 🔧 API Integrations

### Google Routes API
- **Purpose**: Real-time traffic data
- **Fallback**: Mock data when unavailable
- **Service**: `GoogleRoutesService`

### OpenAI GPT-4o-mini
- **Purpose**: AI-generated delay messages
- **Fallback**: Template messages
- **Service**: `OpenAIService`

### Notification Services
- **Email**: Mailjet via `EmailNotificationStrategy`
- **SMS**: Twilio via `SMSNotificationStrategy`
- **Manager**: `NotificationManager` orchestrates all channels

## 🎯 Workflow Process

1. **Fetch Traffic Data**: Get current conditions from Google Routes
2. **Calculate Delays**: Compare current vs estimated duration
3. **Check Threshold**: Only proceed if delay exceeds limit (default: 30min)
4. **Generate Messages**: AI creates personalized notifications
5. **Send Notifications**: Multi-channel delivery with result tracking

## 📖 Usage

1. Open http://localhost:3000
2. Fill in route details (origin, destination, customer contact)
3. Click "Start Traffic Monitoring"
4. Use "Check Status" to view progress and results

The system uses real APIs when configured, or mock data for demonstration.

## 🛠️ Error Handling

- **Google Routes**: Falls back to mock traffic data
- **OpenAI**: Uses template messages when AI unavailable
- **Notifications**: Continues with available channels
- **Temporal**: Built-in retries and state persistence

## 🧪 Extending the System

Adding new notification channels is straightforward:

```typescript
// 1. Create new strategy
export class SlackNotificationStrategy implements NotificationStrategy {
  canSend(): boolean { return !!process.env.SLACK_WEBHOOK_URL; }
  async send(data: NotificationData): Promise<NotificationResult> { /* ... */ }
  getType(): NotificationChannelType { return 'slack'; }
}

// 2. Register in NotificationManager
this.registerStrategy(new SlackNotificationStrategy());

// 3. Export in index.ts
export { SlackNotificationStrategy } from './strategies/slack-notification.strategy';
```

## 📋 Features

- **Real-time monitoring** with live status updates
- **AI-powered messaging** with channel-specific optimization
- **Multi-channel notifications** with individual result tracking
- **Graceful degradation** when services unavailable
- **Comprehensive logging** for monitoring and debugging
- **Type-safe** implementation with TypeScript
- **Production-ready** with proper error handling
