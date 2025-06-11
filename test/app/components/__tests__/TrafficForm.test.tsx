import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrafficForm from '@/app/components/TrafficForm';
import type { DeliveryRoute } from '@/temporal/types';

describe('TrafficForm', () => {
  const mockRoute: DeliveryRoute = {
    routeId: '',
    origin: '',
    destination: '',
    estimatedDurationMinutes: 30,
    customerEmail: '',
    customerPhone: '',
    delayThresholdMinutes: 15,
  };

  const mockSetTrafficRoute = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderTrafficForm = (
    trafficRoute: DeliveryRoute = mockRoute,
    loading: boolean = false
  ) => {
    return render(
      <TrafficForm
        trafficRoute={trafficRoute}
        setTrafficRoute={mockSetTrafficRoute}
        onSubmit={mockOnSubmit}
        loading={loading}
      />
    );
  };

  it('should render form with all required fields', () => {
    renderTrafficForm();

    expect(screen.getByLabelText(/route id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/origin address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/destination address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/customer email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/customer phone/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start traffic monitoring/i })).toBeInTheDocument();
  });

  it('should handle form input changes', async () => {
    const user = userEvent.setup();
    renderTrafficForm();

    const routeInput = screen.getByLabelText(/route id/i);
    await user.type(routeInput, 'TEST-001');

    expect(mockSetTrafficRoute).toHaveBeenCalled();
  });

  it('should disable submit button when required fields are missing', () => {
    renderTrafficForm(mockRoute); // Empty form

    const submitButton = screen.getByRole('button', { name: /start traffic monitoring/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when required fields are filled', () => {
    const validRoute = {
      ...mockRoute,
      routeId: 'TEST-001',
      origin: 'San Francisco',
      destination: 'Los Angeles', 
      customerEmail: 'test@example.com',
    };

    renderTrafficForm(validRoute);

    const submitButton = screen.getByRole('button', { name: /start traffic monitoring/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('should show loading state', () => {
    renderTrafficForm(mockRoute, true);

    expect(screen.getByText('Starting Monitor...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
}); 