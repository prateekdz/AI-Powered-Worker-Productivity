const mongoose = require('mongoose');

const WorkstationSchema = new mongoose.Schema({
  station_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  station_type: { type: String, required: true },
  image_url: { type: String }
}, { collection: 'workstations', versionKey: false });

module.exports = mongoose.model('Workstation', WorkstationSchema);
