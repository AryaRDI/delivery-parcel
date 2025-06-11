import '@testing-library/jest-dom';

// Polyfills for Temporal testing
global.setImmediate = global.setImmediate || ((fn: (...args: any[]) => void, ...args: any[]) => global.setTimeout(fn, 0, ...args));
global.clearImmediate = global.clearImmediate || global.clearTimeout;

// Mock email service to prevent API key requirements
jest.mock('@/temporal/services/api/email-service', () => ({
  EmailService: {
    sendEmail: jest.fn().mockResolvedValue({ success: true }),
  },
}));

// Mock SMS service
jest.mock('@/temporal/services/api/sms-service', () => ({
  SMSService: {
    sendSMS: jest.fn().mockResolvedValue({ success: true }),
  },
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '';
  },
}));

// Mock environment variables properly
Object.defineProperty(process.env, 'NODE_ENV', {
  value: 'test',
  writable: true,
});

// Global test utilities
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  // Suppress console.log in tests unless explicitly testing it
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup for API mocking
beforeEach(() => {
  jest.clearAllMocks();
}); 