import { DeliveryRoute } from '@/temporal/types';

interface TrafficFormProps {
  trafficRoute: DeliveryRoute;
  setTrafficRoute: (route: DeliveryRoute) => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function TrafficForm({ 
  trafficRoute, 
  setTrafficRoute, 
  onSubmit, 
  loading 
}: TrafficFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trafficRoute.routeId || !trafficRoute.origin || !trafficRoute.destination || !trafficRoute.customerEmail) {
      return;
    }
    onSubmit();
  };

  return (
    <>
      <div className="flex items-center space-x-3 mb-8">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
          <span className="text-2xl">🚦</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Monitor Traffic Delays</h2>
          <p className="text-slate-600">Set up real-time traffic monitoring for routes</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          <div className="group">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Route ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={trafficRoute.routeId}
              onChange={(e) => setTrafficRoute({ ...trafficRoute, routeId: e.target.value })}
              className="block w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm 
                         focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white
                         transition-all duration-200 placeholder-slate-400"
              placeholder="ROUTE-001"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Origin Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={trafficRoute.origin}
                onChange={(e) => setTrafficRoute({ ...trafficRoute, origin: e.target.value })}
                className="block w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm 
                           focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white
                           transition-all duration-200 placeholder-slate-400"
                placeholder="123 Warehouse St, City, State"
                required
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Destination Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={trafficRoute.destination}
                onChange={(e) => setTrafficRoute({ ...trafficRoute, destination: e.target.value })}
                className="block w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm 
                           focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white
                           transition-all duration-200 placeholder-slate-400"
                placeholder="456 Customer Ave, City, State"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Customer Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={trafficRoute.customerEmail}
                onChange={(e) => setTrafficRoute({ ...trafficRoute, customerEmail: e.target.value })}
                className="block w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm 
                           focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white
                           transition-all duration-200 placeholder-slate-400"
                placeholder="customer@example.com"
                required
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Customer Phone <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="tel"
                value={trafficRoute.customerPhone}
                onChange={(e) => setTrafficRoute({ ...trafficRoute, customerPhone: e.target.value })}
                className="block w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm 
                           focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white
                           transition-all duration-200 placeholder-slate-400"
                placeholder="+1234567890"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                value={trafficRoute.estimatedDurationMinutes}
                onChange={(e) => setTrafficRoute({ ...trafficRoute, estimatedDurationMinutes: parseInt(e.target.value) })}
                className="block w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm 
                           focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white
                           transition-all duration-200"
                min="1"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Delay Threshold (minutes)
              </label>
              <input
                type="number"
                value={trafficRoute.delayThresholdMinutes}
                onChange={(e) => setTrafficRoute({ ...trafficRoute, delayThresholdMinutes: parseInt(e.target.value) })}
                className="block w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm 
                           focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white
                           transition-all duration-200"
                min="1"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !trafficRoute.routeId || !trafficRoute.origin || !trafficRoute.destination || !trafficRoute.customerEmail}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold py-4 px-6 
                     rounded-xl shadow-lg shadow-orange-600/25 hover:shadow-xl hover:shadow-orange-600/30
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                     transform transition-all duration-200 hover:scale-105 active:scale-95"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Starting Monitor...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>📡</span>
              <span>Start Traffic Monitoring</span>
            </div>
          )}
        </button>
      </form>
    </>
  );
} 