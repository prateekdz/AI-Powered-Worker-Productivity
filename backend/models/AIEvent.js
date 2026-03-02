const mongoose = require('mongoose');

const AIEventSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  worker_id: { type: String, required: true },
  workstation_id: { type: String, required: true },
  event_type: { type: String, required: true, enum: ['working','idle','product_count'] },
  confidence: { type: Number, required: true },
  count: { type: Number, default: 0 }
}, { collection: 'ai_events', versionKey: false });

module.exports = mongoose.model('AIEvent', AIEventSchema);
