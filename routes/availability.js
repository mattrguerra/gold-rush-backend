const express = require('express');
const router = express.Router();

// GET /api/availbility/:date
router.get('/:date', (req, res) => {
    const { date } = req.params;
    res.json({ date, slots: [] });
});

// POST /api/availability (admin - set available slots)
router.post('/', (req, res) => {
    const availabilityData = req.body;
    res.status(201).json({
        message: 'Availability set',
        data: availabilityData
    });
});

module.exports = router;