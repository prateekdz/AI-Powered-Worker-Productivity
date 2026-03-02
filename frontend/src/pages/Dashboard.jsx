import { useEffect, useState } from "react";
import axios from "axios";
import { Activity, Users, Clock, Box, TrendingUp, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// use Vite environment variable instead of process.env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [factoryMetrics, setFactoryMetrics] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [metricsRes, eventsRes] = await Promise.all([
        axios.get(`${API}/metrics/factory`),
        axios.get(`${API}/events/recent?limit=10`)
      ]);
      setFactoryMetrics(metricsRes.data);
      setRecentEvents(eventsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" data-testid="loading-spinner">
        <div className="text-slate-600">Loading dashboard...</div>
      </div>
    );
  }

  const pieData = factoryMetrics ? [
    { name: "Active", value: factoryMetrics.active_workers, color: "#10b981" },
    { name: "Idle", value: factoryMetrics.idle_workers, color: "#f59e0b" },
    { name: "Offline", value: factoryMetrics.offline_workers, color: "#64748b" }
  ] : [];

  const summaryCards = [
    {
      title: "Production Count",
      value: factoryMetrics?.total_production_count || 0,
      icon: Box,
      color: "text-orange-500",
      testId: "production-count"
    },
    {
      title: "Active Workers",
      value: factoryMetrics?.active_workers || 0,
      icon: Users,
      color: "text-emerald-500",
      testId: "active-workers"
    },
    {
      title: "Avg Utilization",
      value: `${factoryMetrics?.average_utilization.toFixed(1) || 0}%`,
      icon: TrendingUp,
      color: "text-blue-500",
      testId: "avg-utilization"
    },
    {
      title: "Productive Time",
      value: `${factoryMetrics?.total_productive_time.toFixed(1) || 0}h`,
      icon: Clock,
      color: "text-purple-500",
      testId: "productive-time"
    }
  ];

  return (
    <div className="p-6" data-testid="dashboard-page">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Factory Overview
          </h1>
          <p className="text-sm text-slate-600 mt-1">Real-time productivity monitoring</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="metric-card p-4" data-testid={card.testId}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {card.title}
                  </span>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div className="data-value text-2xl font-bold text-slate-900">{card.value}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 metric-card p-6 chart-container" data-testid="worker-distribution-chart">
            <h2 className="text-xl font-semibold text-slate-800 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Worker Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {factoryMetrics && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-slate-700">
                  {factoryMetrics.active_workers + factoryMetrics.idle_workers + factoryMetrics.offline_workers} workers
                </span>
              </div>
            )}
          </div>

          <div className="metric-card p-6 mt-4 lg:mt-0" data-testid="live-feed">
            <h2 className="text-xl font-semibold text-slate-800 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Live Activity Feed
            </h2>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {recentEvents.map((event, idx) => (
                <div key={idx} className="text-xs border-l-2 border-slate-200 pl-3 py-1" data-testid={`event-${idx}`}>
                  <div className="flex items-center gap-2">
                    {event.event_type === "working" && (
                      <Activity className="h-3 w-3 text-emerald-500" />
                    )}
                    {event.event_type === "idle" && (
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                    )}
                    {event.event_type === "product_count" && (
                      <Box className="h-3 w-3 text-orange-500" />
                    )}
                    <span className="font-medium text-slate-700">{event.worker_name}</span>
                  </div>
                  <div className="text-slate-500 mt-1">
                    {event.event_type === "product_count"
                      ? `Produced ${event.count} units at ${event.workstation_name}`
                      : `${event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)} at ${event.workstation_name}`}
                  </div>
                  <div className="text-slate-400 text-[10px] mt-1">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 metric-card p-6" data-testid="production-summary">
          <h2 className="text-xl font-semibold text-slate-800 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Production Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Total Production
              </div>
              <div className="data-value text-3xl font-bold text-slate-900">
                {factoryMetrics?.total_production_count || 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">units completed</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Avg Production Rate
              </div>
              <div className="data-value text-3xl font-bold text-slate-900">
                {factoryMetrics?.average_production_rate.toFixed(1) || 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">units per hour</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Factory Utilization
              </div>
              <div className="data-value text-3xl font-bold text-slate-900">
                {factoryMetrics?.average_utilization.toFixed(1) || 0}%
              </div>
              <div className="text-xs text-slate-500 mt-1">overall efficiency</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;