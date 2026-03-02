const AIEvent = require('../models/AIEvent');
const Worker = require('../models/Worker');
const Workstation = require('../models/Workstation');

async function ingestEvent(req, res, next) {
  try {
    const event = new AIEvent(req.body);
    await event.save();
    res.json({ status: 'success', message: 'Event ingested' });
  } catch (err) {
    next(err);
  }
}

async function seedData(req, res, next) {
  try {
    await Worker.deleteMany({});
    await Workstation.deleteMany({});
    await AIEvent.deleteMany({});

    const workers_data = [
      { worker_id: "W1", name: "Marco Rossi", role: "Assembly Specialist", image_url: "https://images.unsplash.com/photo-1617191562278-8159455f52e1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHw0fHxmYWN0b3J5JTIwd29ya2VyJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MHx8fHwxNzcyNDQ1NjQyfDA&ixlib=rb-4.1.0&q=85" },
      { worker_id: "W2", name: "Sarah Chen", role: "Quality Control", image_url: "https://images.unsplash.com/photo-1741707038935-0bf1f8eda81c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxmYWN0b3J5JTIwd29ya2VyJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MHx8fHwxNzcyNDQ1NjQyfDA&ixlib=rb-4.1.0&q=85" },
      { worker_id: "W3", name: "David Miller", role: "Machine Operator", image_url: "https://images.unsplash.com/photo-1579355879315-46da233c9321?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxmYWN0b3J5JTIwd29ya2VyJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MHx8fHwxNzcyNDQ1NjQyfDA&ixlib=rb-4.1.0&q=85" },
      { worker_id: "W4", name: "Elena Rodriguez", role: "Line Supervisor", image_url: "https://images.unsplash.com/photo-1741707039387-ac8025a4c36e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxmZW1hbGUlMjBmYWN0b3J5JTIwd29ya2VyJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MHx8fHwxNzcyNDQ1NjU0fDA&ixlib=rb-4.1.0&q=85" },
      { worker_id: "W5", name: "James Wilson", role: "Technician", image_url: "https://images.unsplash.com/photo-1649960861740-c8c8c8022b27?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwzfHxmYWN0b3J5JTIwd29ya2VyJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MHx8fHwxNzcyNDQ1NjQyfDA&ixlib=rb-4.1.0&q=85" },
      { worker_id: "W6", name: "Lisa Patricks", role: "Assembly Worker", image_url: "https://images.unsplash.com/photo-1754747197676-478943a4a185?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBmYWN0b3J5JTIwd29ya2VyJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MHx8fHwxNzcyNDQ1NjU0fDA&ixlib=rb-4.1.0&q=85" }
    ];

    const workstations_data = [
      { station_id: "S1", name: "Assembly Unit A", station_type: "Assembly", image_url: "https://images.unsplash.com/photo-1563968743333-044cef800494?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHw0fHxpbmR1c3RyaWFsJTIwYXV0b21hdGVkJTIwYXNzZW1ibHklMjBsaW5lJTIwcm9ib3RpYyUyMGFybXxlbnwwfHx8fDE3NzI0NDU2NDV8MA&ixlib=rb-4.1.0&q=85" },
      { station_id: "S2", name: "Packaging Line 1", station_type: "Packaging", image_url: "https://images.unsplash.com/photo-1647427060118-4911c9821b82?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwYXV0b21hdGVkJTIwYXNzZW1ibHklMjBsaW5lJTIwcm9ib3RpYyUyMGFybXxlbnwwfHx8fDE3NzI0NDU2NDV8MA&ixlib=rb-4.1.0&q=85" },
      { station_id: "S3", name: "Robotic Welding", station_type: "Welding", image_url: "https://images.unsplash.com/photo-1716972899074-2d8ace6f700a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwyfHxpbmR1c3RyaWFsJTIwYXV0b21hdGVkJTIwYXNzZW1ibHklMjBsaW5lJTIwcm9ib3RpYyUyMGFybXxlbnwwfHx8fDE3NzI0NDU2NDV8MA&ixlib=rb-4.1.0&q=85" },
      { station_id: "S4", name: "Quality Check Station", station_type: "Quality Control", image_url: "https://images.unsplash.com/photo-1563968743333-044cef800494?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHw0fHxpbmR1c3RyaWFsJTIwYXV0b21hdGVkJTIwYXNzZW1ibHklMjBsaW5lJTIwcm9ib3RpYyUyMGFybXxlbnwwfHx8fDE3NzI0NDU2NDV8MA&ixlib=rb-4.1.0&q=85" },
      { station_id: "S5", name: "CNC Machining", station_type: "Machining", image_url: "https://images.unsplash.com/photo-1647427060118-4911c9821b82?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwYXV0b21hdGVkJTIwYXNzZW1ibHklMjBsaW5lJTIwcm9ib3RpYyUyMGFybXxlbnwwfHx8fDE3NzI0NDU2NDV8MA&ixlib=rb-4.1.0&q=85" },
      { station_id: "S6", name: "Final Assembly", station_type: "Assembly", image_url: "https://images.unsplash.com/photo-1716972899074-2d8ace6f700a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwyfHxpbmR1c3RyaWFsJTIwYXV0b21hdGVkJTIwYXNzZW1ibHklMjBsaW5lJTIwcm9ib3RpYyUyMGFybXxlbnwwfHx8fDE3NzI0NDU2NDV8MA&ixlib=rb-4.1.0&q=85" }
    ];

    await Worker.insertMany(workers_data);
    await Workstation.insertMany(workstations_data);

    const now = new Date();
    const events = [];
    for (let hour_offset = 8; hour_offset > 0; hour_offset--) {
      for (const worker of workers_data) {
        const station_id = workstations_data[Math.floor(Math.random() * workstations_data.length)].station_id;
        const event_timestamp = new Date(now.getTime() - (hour_offset * 60 + Math.floor(Math.random()*60)) * 60000);
        if (Math.random() < 0.75) {
          events.push({
            timestamp: event_timestamp,
            worker_id: worker.worker_id,
            workstation_id: station_id,
            event_type: 'working',
            confidence: parseFloat((Math.random() * (0.98-0.85) + 0.85).toFixed(2)),
            count: 0
          });
          if (Math.random() < 0.6) {
            const product_event_time = new Date(event_timestamp.getTime() + Math.floor(Math.random()*30+15) * 60000);
            events.push({
              timestamp: product_event_time,
              worker_id: worker.worker_id,
              workstation_id: station_id,
              event_type: 'product_count',
              confidence: parseFloat((Math.random() * (0.99-0.90) + 0.90).toFixed(2)),
              count: Math.floor(Math.random()*16)+5
            });
          }
        } else {
          events.push({
            timestamp: event_timestamp,
            worker_id: worker.worker_id,
            workstation_id: station_id,
            event_type: 'idle',
            confidence: parseFloat((Math.random() * (0.95-0.80) + 0.80).toFixed(2)),
            count: 0
          });
        }
      }
    }

    if (events.length) {
      await AIEvent.insertMany(events);
    }

    res.json({ status: 'success', message: 'Database seeded', workers_count: workers_data.length, workstations_count: workstations_data.length, events_count: events.length });
  } catch (err) {
    next(err);
  }
}

async function getRecentEvents(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const events = await AIEvent.find({}).sort({ timestamp: -1 }).limit(limit).lean();
    const workers = await Worker.find({}).lean();
    const workstations = await Workstation.find({}).lean();

    const workerMap = {};
    workers.forEach(w => { workerMap[w.worker_id] = w.name; });
    const stationMap = {};
    workstations.forEach(s => { stationMap[s.station_id] = s.name; });

    const enriched = events.map(e => ({
      ...e,
      worker_name: workerMap[e.worker_id] || 'Unknown',
      workstation_name: stationMap[e.workstation_id] || 'Unknown'
    }));

    res.json(enriched);
  } catch (err) {
    next(err);
  }
}

module.exports = { ingestEvent, seedData, getRecentEvents };
