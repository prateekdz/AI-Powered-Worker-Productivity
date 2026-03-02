const express = require('express');
const router = express.Router();
const { getFactoryMetrics, getWorkerMetrics, getWorkstationMetrics } = require('../controllers/metricsController');

router.get('/factory', getFactoryMetrics);
router.get('/workers', getWorkerMetrics);
router.get('/workstations', getWorkstationMetrics);

module.exports = router;