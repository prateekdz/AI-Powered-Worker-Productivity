import { useEffect, useState } from "react";
import axios from "axios";
import { Activity, TrendingUp, Box, Clock } from "lucide-react";

// Vite env variable (must start with VITE_)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const Workstations = () => {
  const [workstations, setWorkstations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    fetchWorkstations();
    const interval = setInterval(fetchWorkstations, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchWorkstations = async () => {
    try {
      const response = await axios.get(`${API}/metrics/workstations`);
      setWorkstations(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching workstations:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" data-testid="loading-spinner">
        <div className="text-slate-600">Loading workstations...</div>
      </div>
    );
  }

  const displayStation = selectedStation || (workstations.length > 0 ? workstations[0] : null);

  return (
    <div className="p-6" data-testid="workstations-page">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Workstation Analytics
          </h1>
          <p className="text-sm text-slate-600 mt-1">Station utilization and throughput</p>
        </div>

        {displayStation && (
          <div className="metric-card p-6 mb-6" data-testid="station-detail-card">
            <div className="flex items-start gap-6">
              <img
                src={displayStation.image_url}
                alt={displayStation.name}
                className="w-32 h-24 rounded-sm object-cover border border-slate-200"
                data-testid="station-image"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {displayStation.name}
                    </h2>
                    <p className="text-sm text-slate-600">{displayStation.station_type}</p>
                  </div>
                  <span
                    className={`status-badge ${
                      displayStation.status === "active"
                        ? "status-active"
                        : displayStation.status === "idle"
                        ? "status-idle"
                        : "status-offline"
                    }`}
                    data-testid="station-status"
                  >
                    {displayStation.status.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Occupancy Time
                    </div>
                    <div className="data-value text-xl font-bold text-slate-900">
                      {displayStation.occupancy_time}h
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Utilization
                    </div>
                    <div className="data-value text-xl font-bold text-slate-900">
                      {displayStation.utilization_percentage.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Units Produced
                    </div>
                    <div className="data-value text-xl font-bold text-slate-900">
                      {displayStation.total_units_produced}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Throughput
                    </div>
                    <div className="data-value text-xl font-bold text-slate-900">
                      {displayStation.throughput_rate.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="metric-card" data-testid="workstations-table">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Workstation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Occupancy
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Utilization
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Units
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Throughput
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {workstations.map((station) => (
                  <tr
                    key={station.station_id}
                    className="hover:bg-slate-50 transition-colors duration-200"
                    data-testid={`station-row-${station.station_id}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={station.image_url}
                          alt={station.name}
                          className="w-16 h-12 rounded-sm object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-medium text-sm text-slate-900">{station.name}</div>
                          <div className="text-xs text-slate-500">{station.station_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`status-badge ${
                          station.status === "active"
                            ? "status-active"
                            : station.status === "idle"
                            ? "status-idle"
                            : "status-offline"
                        }`}
                      >
                        {station.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 data-value text-sm text-slate-900">
                      {station.occupancy_time}h
                    </td>
                    <td className="px-4 py-3 data-value text-sm text-slate-900">
                      {station.utilization_percentage.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 data-value text-sm text-slate-900">
                      {station.total_units_produced}
                    </td>
                    <td className="px-4 py-3 data-value text-sm text-slate-900">
                      {station.throughput_rate.toFixed(1)}/h
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedStation(station)}
                        className="text-sm font-medium text-orange-500 hover:text-orange-600"
                        data-testid={`view-station-${station.station_id}`}
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

export default Workstations;