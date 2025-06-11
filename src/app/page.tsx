'use client';

import { useState } from 'react';
import type { DeliveryRoute } from '@/temporal/types';
import TrafficForm from './components/TrafficForm';
import TrafficControls from './components/TrafficControls';
import TrafficStatus, { type TrafficWorkflowInfo } from './components/TrafficStatus';

export default function Home() {
  const [trafficRoute, setTrafficRoute] = useState<DeliveryRoute>({
    routeId: '',
    origin: '',
    destination: '',
    estimatedDurationMinutes: 60,
    customerEmail: '',
    customerPhone: '',
    delayThresholdMinutes: 30,
  });
  const [currentTrafficWorkflow, setCurrentTrafficWorkflow] = useState<string | null>(null);
  const [trafficWorkflowInfo, setTrafficWorkflowInfo] = useState<TrafficWorkflowInfo | null>(null);
  
  const [loading, setLoading] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      console.log('✅', message);
    } else {
      console.error('❌', message);
    }
    alert(message);
  };

  const startTrafficMonitoring = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/traffic/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trafficRoute),
      });

      const result = await response.json();
      if (result.success) {
        setCurrentTrafficWorkflow(result.workflowId);
        showNotification(`Traffic monitoring started! ID: ${result.workflowId}`);
      } else {
        showNotification(`Error: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error starting traffic monitoring:', error);
      showNotification('Failed to start traffic monitoring', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkTrafficStatus = async () => {
    if (!currentTrafficWorkflow) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/traffic/status/${currentTrafficWorkflow}`);
      const result = await response.json();
      
      if (response.ok) {
        setTrafficWorkflowInfo(result);
      } else {
        showNotification(`Error: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error checking traffic status:', error);
      showNotification('Failed to check traffic status', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🚦</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Traffic Delay Monitoring
              </h1>
              <p className="text-slate-600 mt-1">
                Monitor traffic conditions and send AI-powered delay notifications
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <TrafficForm
              trafficRoute={trafficRoute}
              setTrafficRoute={setTrafficRoute}
              onSubmit={startTrafficMonitoring}
              loading={loading}
            />

            {currentTrafficWorkflow && (
              <TrafficControls
                workflowId={currentTrafficWorkflow}
                onCheckStatus={checkTrafficStatus}
                loading={loading}
              />
            )}
          </div>

          <div className="space-y-6">
            {trafficWorkflowInfo && (
              <TrafficStatus workflowInfo={trafficWorkflowInfo} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
