const Worker = require('../models/Worker');
const Workstation = require('../models/Workstation');
const AIEvent = require('../models/AIEvent');

function calculateFactoryMetrics(events, workers) {
  if (!events || events.length === 0) {
    return {
      total_productive_time: 0,
      total_production_count: 0,
      average_production_rate: 0,
      average_utilization: 0,
      active_workers: 0,
      idle_workers: 0,
      offline_workers: workers.length
    };
  }

  const total_production = events
    .filter(e => e.event_type === 'product_count')
    .reduce((sum, e) => sum + (e.count || 0), 0);

  const working_events = events.filter(e => e.event_type === 'working');
  const total_working_time = working_events.length * 0.5;

  const workerIds = new Set(workers.map(w => w.worker_id));
  const recent_events = events
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 50);

  const active_workers_set = new Set(recent_events.filter(e => e.event_type === 'working').map(e => e.worker_id));
  const idle_workers_set = new Set(recent_events.filter(e => e.event_type === 'idle').map(e => e.worker_id));
  idle_workers_set.forEach(id => { if (active_workers_set.has(id)) idle_workers_set.delete(id); });
  const offline_workers_set = new Set([...workerIds].filter(id => !active_workers_set.has(id) && !idle_workers_set.has(id)));

  const avg_production_rate = total_production / 8;
  const avg_utilization = events.length > 0 ? (working_events.length / events.length) * 100 : 0;

  return {
    total_productive_time: parseFloat(total_working_time.toFixed(2)),
    total_production_count: total_production,
    average_production_rate: parseFloat(avg_production_rate.toFixed(2)),
    average_utilization: parseFloat(avg_utilization.toFixed(2)),
    active_workers: active_workers_set.size,
    idle_workers: idle_workers_set.size,
    offline_workers: offline_workers_set.size
  };
}

async function getFactoryMetrics(req, res, next) {
  try {
    const events = await AIEvent.find({}).lean();
    const workers = await Worker.find({}).lean();
    const metrics = calculateFactoryMetrics(events, workers);
    res.json(metrics);
  } catch (err) {
    next(err);
  }
}

async function getWorkerMetrics(req, res, next) {
  try {
    const workers = await Worker.find({}).lean();
    const events = await AIEvent.find({}).lean();
    const recent_events = events
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50);

    const metrics = workers.map(worker => {
      const worker_events = events.filter(e => e.worker_id === worker.worker_id);
      const working_events = worker_events.filter(e => e.event_type === 'working');
      const idle_events = worker_events.filter(e => e.event_type === 'idle');
      const product_events = worker_events.filter(e => e.event_type === 'product_count');

      const active_time = working_events.length * 0.5;
      const idle_time = idle_events.length * 0.5;
      const total_time = active_time + idle_time;
      const utilization = total_time > 0 ? (active_time / total_time * 100) : 0;
      const total_units = product_events.reduce((sum, e) => sum + (e.count || 0), 0);
      const units_per_hour = active_time > 0 ? (total_units / active_time) : 0;

      const recent_worker_events = recent_events.filter(e => e.worker_id === worker.worker_id);
      let status = 'offline';
      if (recent_worker_events.length > 0) {
        const last_event = recent_worker_events[0];
        if (last_event.event_type === 'working') status = 'active';
        else if (last_event.event_type === 'idle') status = 'idle';
        else status = 'active';
      }

      return {
        worker_id: worker.worker_id,
        name: worker.name,
        role: worker.role,
        image_url: worker.image_url,
        total_active_time: parseFloat(active_time.toFixed(2)),
        total_idle_time: parseFloat(idle_time.toFixed(2)),
        utilization_percentage: parseFloat(utilization.toFixed(2)),
        total_units_produced: total_units,
        units_per_hour: parseFloat(units_per_hour.toFixed(2)),
        status
      };
    });

    res.json(metrics);
  } catch (err) {
    next(err);
  }
}

async function getWorkstationMetrics(req, res, next) {
  try {
    const workstations = await Workstation.find({}).lean();
    const events = await AIEvent.find({}).lean();
    const recent_events = events
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50);

    const metrics = workstations.map(station => {
      const station_events = events.filter(e => e.workstation_id === station.station_id);
      const working_events = station_events.filter(e => e.event_type === 'working');
      const product_events = station_events.filter(e => e.event_type === 'product_count');

      const occupancy_time = working_events.length * 0.5;
      const total_possible_time = 8 * 6;
      const utilization = total_possible_time > 0 ? (occupancy_time / total_possible_time * 100) : 0;
      const total_units = product_events.reduce((sum, e) => sum + (e.count || 0), 0);
      const throughput = occupancy_time > 0 ? (total_units / occupancy_time) : 0;

      const recent_station_events = recent_events.filter(e => e.workstation_id === station.station_id);
      let status = 'offline';
      if (recent_station_events.length > 0) {
        const last_event = recent_station_events[0];
        status = last_event.event_type === 'working' ? 'active' : 'idle';
      }

      return {
        station_id: station.station_id,
        name: station.name,
        station_type: station.station_type,
        image_url: station.image_url,
        occupancy_time: parseFloat(occupancy_time.toFixed(2)),
        utilization_percentage: parseFloat(utilization.toFixed(2)),
        total_units_produced: total_units,
        throughput_rate: parseFloat(throughput.toFixed(2)),
        status
      };
    });

    res.json(metrics);
  } catch (err) {
    next(err);
  }
}

module.exports = { getFactoryMetrics, getWorkerMetrics, getWorkstationMetrics };
