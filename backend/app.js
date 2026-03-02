require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const metricsRoutes = require('./routes/metricsRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();

// middleware
app.use(express.json());
const origins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'];
app.use(cors({ origin: origins, credentials: true }));

// routes
app.use('/api/metrics', metricsRoutes);
app.use('/api', eventRoutes);

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// connect to DB & start
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'AI_Dashboard';

mongoose.connect(mongoUrl, { dbName, useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB connected');

    // auto-seed if no workers present
    const Worker = require('./models/Worker');
    const { seedData } = require('./controllers/eventController');
    try {
      const count = await Worker.countDocuments();
      if (count === 0) {
        console.log('No data found. Seeding database...');
        // call controller manually
        await seedData({ body: {} }, { json: r => console.log('Seed result:', r) }, console.error);
        console.log('Database seeded successfully');
      }
    } catch (e) {
      console.warn('Seeding check failed:', e);
    }

    const port = parseInt(process.env.PORT) || 3001;
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Mongo connection error:', err);
  });

module.exports = app;
