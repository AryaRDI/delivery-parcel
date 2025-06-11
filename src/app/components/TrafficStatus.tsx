import type { TrafficData, DelayNotification } from '@/temporal/types';

interface TrafficWorkflowInfo {
  workflowId: string;
  monitoringState: string;
  trafficStatus: TrafficData | null;
  notificationStatus: DelayNotification | undefined;
  executionStatus: string;
  startTime: string;
  closeTime?: string;
}

interface TrafficStatusProps {
  workflowInfo: TrafficWorkflowInfo;
}

export default function TrafficStatus({ workflowInfo }: TrafficStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed_success': return 'from-green-500 to-emerald-600';
      case 'delay_detected': return 'from-yellow-500 to-orange-600';
      case 'failed': return 'from-red-500 to-pink-600';
      case 'sending_notification': return 'from-blue-500 to-indigo-600';
      default: return 'from-slate-500 to-gray-600';
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <span className="text-lg">📈</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Traffic Status</h3>
          <p className="text-sm text-slate-600">Real-time monitoring state</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Workflow State */}
        <div className="bg-slate-50/50 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-700">Monitoring State:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getStatusColor(workflowInfo.monitoringState)}`}>
              {workflowInfo.monitoringState}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-700">Execution:</span>
            <span className="text-slate-900">{workflowInfo.executionStatus}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-700">Started:</span>
            <span className="text-slate-900">{new Date(workflowInfo.startTime).toLocaleString()}</span>
          </div>
        </div>

        {/* Traffic Data */}
        {workflowInfo.trafficStatus && (
          <div className="bg-orange-50/50 rounded-2xl p-4 space-y-3">
            <h4 className="font-bold text-orange-900 mb-3">🚦 Traffic Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-orange-700">Route ID:</span>
                <span className="text-orange-900">{workflowInfo.trafficStatus.routeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-orange-700">Delay:</span>
                <span className="text-orange-900">{workflowInfo.trafficStatus.delayMinutes} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-orange-700">Condition:</span>
                <span className="text-orange-900 capitalize">{workflowInfo.trafficStatus.trafficCondition}</span>
              </div>
            </div>
          </div>
        )}

        {/* Notification Status */}
        {workflowInfo.notificationStatus && (
          <div className="bg-blue-50/50 rounded-2xl p-4 space-y-3">
            <h4 className="font-bold text-blue-900 mb-3">📧 Notification Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-blue-700">Success:</span>
                <span className={workflowInfo.notificationStatus.success ? 'text-green-600' : 'text-red-600'}>
                  {workflowInfo.notificationStatus.success ? '✅ Sent' : '❌ Failed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-700">Type:</span>
                <span className="text-blue-900 capitalize">{workflowInfo.notificationStatus.notificationType}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export type { TrafficWorkflowInfo }; 