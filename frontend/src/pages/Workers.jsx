import { useEffect, useState } from "react";
import axios from "axios";
import { Clock, TrendingUp, Box, Activity } from "lucide-react";

// Vite env variable (must start with VITE_)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);

  useEffect(() => {
    fetchWorkers();
    const interval = setInterval(fetchWorkers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await axios.get(`${API}/metrics/workers`);
      setWorkers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching workers:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" data-testid="loading-spinner">
        <div className="text-slate-600">Loading workers...</div>
      </div>
    );
  }

  const displayWorker = selectedWorker || (workers.length > 0 ? workers[0] : null);

  return (
    <div className="p-6" data-testid="workers-page">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Worker Productivity
          </h1>
          <p className="text-sm text-slate-600 mt-1">Individual performance metrics</p>
        </div>

        {displayWorker && (
          <div className="metric-card p-6 mb-6" data-testid="worker-detail-card">
            <div className="flex items-start gap-6">
              <img
                src={displayWorker.image_url}
                alt={displayWorker.name}
                className="w-24 h-24 rounded-sm object-cover border border-slate-200"
                data-testid="worker-image"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {displayWorker.name}
                    </h2>
                    <p className="text-sm text-slate-600">{displayWorker.role}</p>
                  </div>
                  <span
                    className={`status-badge ${
                      displayWorker.status === "active"
                        ? "status-active"
                        : displayWorker.status === "idle"
                        ? "status-idle"
                        : "status-offline"
                    }`}
                    data-testid="worker-status"
                  >
                    {displayWorker.status.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Active Time
                    </div>
                    <div className="data-value text-xl font-bold text-slate-900">
                      {displayWorker.total_active_time}h
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Utilization
                    </div>
                    <div className="data-value text-xl font-bold text-slate-900">
                      {displayWorker.utilization_percentage.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Units Produced
                    </div>
                    <div className="data-value text-xl font-bold text-slate-900">
                      {displayWorker.total_units_produced}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Units/Hour
                    </div>
                    <div className="data-value text-xl font-bold text-slate-900">
                      {displayWorker.units_per_hour.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="metric-card" data-testid="workers-table">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Worker
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Active Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Idle Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Utilization
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Units
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Units/Hr
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {workers.map((worker) => (
                  <tr
                    key={worker.worker_id}
                    className="hover:bg-slate-50 transition-colors duration-200"
                    data-testid={`worker-row-${worker.worker_id}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={worker.image_url}
                          alt={worker.name}
                          className="w-10 h-10 rounded-sm object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-medium text-sm text-slate-900">{worker.name}</div>
                          <div className="text-xs text-slate-500">{worker.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`status-badge ${
                          worker.status === "active"
                            ? "status-active"
                            : worker.status === "idle"
                            ? "status-idle"
                            : "status-offline"
                        }`}
                      >
                        {worker.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 data-value text-sm text-slate-900">
                      {worker.total_active_time}h
                    </td>
                    <td className="px-4 py-3 data-value text-sm text-slate-900">
                      {worker.total_idle_time}h
                    </td>
                    <td className="px-4 py-3 data-value text-sm text-slate-900">
                      {worker.utilization_percentage.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 data-value text-sm text-slate-900">
                      {worker.total_units_produced}
                    </td>
                    <td className="px-4 py-3 data-value text-sm text-slate-900">
                      {worker.units_per_hour.toFixed(1)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedWorker(worker)}
                        className="text-sm font-medium text-orange-500 hover:text-orange-600"
                        data-testid={`view-worker-${worker.worker_id}`}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workers;