const express = require('express');
const router = express.Router();
const sql = require('../db');

// Get /api/services
router.get('/', async (req, res) => {
    try {
        const services = await sql`SELECT * FROM services`;
        res.json({ services });
    } catch (err) {
        console.error('Error fetching services:', err.message);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

module.exports = router;