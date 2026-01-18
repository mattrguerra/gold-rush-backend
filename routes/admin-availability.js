const express = require('express');
const router = express.Router();
const sql = require('../db');
const authenticateToken = require('../middleware/auth');

// GET /api/admin/availability/blocked-dates
router.get('/blocked-dates', authenticateToken, async (req, res) => {
    try {
        const dates = await sql`
            SELECT date FROM availability WHERE blocked = true ORDER BY date
        `;
        res.json({ dates: dates.map(d => ({ date: d.date })) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch blocked dates' });
    }
});

// POST /api/admin/availability/block-date
router.post('/block-date', authenticateToken, async (req, res) => {
    try {
        const { date } = req.body;
        await sql`
            INSERT INTO availability (date, blocked)
            VALUES (${date}, true)
            ON CONFLICT (date) DO UPDATE SET blocked = true
        `;
        res.json({ message: 'Date blocked' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to block date' });
    }
});

// DELETE /api/admin/availability/unblock-date  
router.delete('/unblock-date', authenticateToken, async (req, res) => {
    try {
        const { date } = req.body;
        await sql`UPDATE availability SET blocked = false WHERE date = ${date}`;
        res.json({ message: 'Date unblocked' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to unblock date' });
    }
});

// GET /api/admin/availability/hours
router.get('/hours', authenticateToken, async (req, res) => {
    const hours = {
        monday: { open: '09:00 AM', close: '06:00 PM', closed: false },
        tuesday: { open: '09:00 AM', close: '06:00 PM', closed: false },
        wednesday: { open: '09:00 AM', close: '06:00 PM', closed: false },
        thursday: { open: '09:00 AM', close: '06:00 PM', closed: false },
        friday: { open: '09:00 AM', close: '06:00 PM', closed: false },
        saturday: { open: '10:00 AM', close: '04:00 PM', closed: false },
        sunday: { open: '', close: '', closed: true }
    };
    res.json({ hours });
});

module.exports = router;