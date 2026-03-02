require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const metricsRoutes = require('./routes/metricsRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();
const path = require('path');

// middleware
app.use(express.json());
const origins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'];
app.use(cors({ origin: origins, credentials: true }));

// routes
app.use('/api/metrics', metricsRoutes);
app.use('/api', eventRoutes);

// serve static files from frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// catch-all: serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// configuration for database connection
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'AI_Dashboard';

// listen on the port immediately so platforms like Render see an open socket
const port = parseInt(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`listening on port ${port} (Render uses PORT env var)`);
});

// attempt to connect to MongoDB; do not block server startup
mongoose.connect(mongoUrl, { dbName, useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB connected', { mongoUrl, dbName });

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
  })
  .catch(err => {
    console.error('Mongo connection error:', err);
    console.error('Environment values used:', { mongoUrl, dbName, port: process.env.PORT, nodeEnv: process.env.NODE_ENV });
    // platform may restart service; leave process running so port stays bound
    // optionally, add retry/backoff logic here if desired
  });

module.exports = app;
