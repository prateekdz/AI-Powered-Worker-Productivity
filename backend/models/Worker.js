const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  worker_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  image_url: { type: String }
}, { collection: 'workers', versionKey: false });

module.exports = mongoose.model('Worker', WorkerSchema);
