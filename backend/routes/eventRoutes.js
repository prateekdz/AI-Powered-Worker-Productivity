const express = require('express');
const router = express.Router();
const { ingestEvent, seedData, getRecentEvents } = require('../controllers/eventController');

router.post('/events', ingestEvent);
router.post('/seed', seedData);
router.get('/events/recent', getRecentEvents);

module.exports = router;