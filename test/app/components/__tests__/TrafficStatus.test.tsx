import React from 'react';
import { render, screen } from '@testing-library/react';
import TrafficStatus, { type TrafficWorkflowInfo } from '@/app/components/TrafficStatus';
import type { TrafficData, DelayNotification } from '@/temporal/types';

describe('TrafficStatus', () => {
  const mockTrafficData: TrafficData = {
    routeId: 'TEST-001',
    currentDurationMinutes: 50,
    estimatedDurationMinutes: 30,
    delayMinutes: 20,
    trafficCondition: 'heavy',
    source: 'Google Routes API',
    lastUpdated: new Date('2024-01-01T12:00:00Z'),
  };

  const mockDelayNotification: DelayNotification = {
    routeId: 'TEST-001',
    success: true,
    delayMinutes: 20,
    message: 'Your delivery may be delayed by 20 minutes due to heavy traffic.',
    sentAt: new Date('2024-01-01T12:05:00Z'),
    notificationType: 'both',
  };

  const baseWorkflowInfo: TrafficWorkflowInfo = {
    workflowId: 'test-workflow-001',
    monitoringState: 'monitoring',
    trafficStatus: mockTrafficData,
    notificationStatus: mockDelayNotification,
    executionStatus: 'RUNNING',
    startTime: '2024-01-01T12:00:00Z',
  };

  it('should render basic traffic status information', () => {
    render(<TrafficStatus workflowInfo={baseWorkflowInfo} />);

    expect(screen.getByText('Traffic Status')).toBeInTheDocument();
    expect(screen.getByText('monitoring')).toBeInTheDocument();
    expect(screen.getByText('RUNNING')).toBeInTheDocument();
  });

  it('should display traffic details when available', () => {
    render(<TrafficStatus workflowInfo={baseWorkflowInfo} />);

    expect(screen.getByText('🚦 Traffic Details')).toBeInTheDocument();
    expect(screen.getByText('TEST-001')).toBeInTheDocument();
    expect(screen.getByText('20 minutes')).toBeInTheDocument();
    expect(screen.getByText('heavy')).toBeInTheDocument();
  });

  it('should display notification status when available', () => {
    render(<TrafficStatus workflowInfo={baseWorkflowInfo} />);

    expect(screen.getByText('📧 Notification Status')).toBeInTheDocument();
    expect(screen.getByText('✅ Sent')).toBeInTheDocument();
    expect(screen.getByText('both')).toBeInTheDocument();
  });

  it('should handle missing traffic data', () => {
    const workflowInfo = {
      ...baseWorkflowInfo,
      trafficStatus: null,
      notificationStatus: undefined,
    };

    render(<TrafficStatus workflowInfo={workflowInfo} />);

    expect(screen.getByText('Traffic Status')).toBeInTheDocument();
    expect(screen.queryByText('🚦 Traffic Details')).not.toBeInTheDocument();
    expect(screen.queryByText('📧 Notification Status')).not.toBeInTheDocument();
  });
}); 