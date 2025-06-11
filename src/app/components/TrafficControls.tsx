interface TrafficControlsProps {
  workflowId: string;
  onCheckStatus: () => void;
  loading: boolean;
}

export default function TrafficControls({ workflowId, onCheckStatus, loading }: TrafficControlsProps) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <span className="text-lg">⚡</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Traffic Controls</h3>
          <p className="text-sm text-slate-600">ID: {workflowId}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onCheckStatus}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 
                     rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transform transition-all duration-200 hover:scale-105 active:scale-95"
        >
          📊 Check Status
        </button>
      </div>
    </div>
  );
} 