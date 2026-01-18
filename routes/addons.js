const express = require('express');
const router = express.Router();
const sql = require('../db');

// GET /api/addons
router.get('/', async (req, res) => {
    try {
        const addons = await sql`
            SELECT * FROM addons 
            WHERE active = true 
            ORDER BY sort_order ASC
        `;

        res.json({ addons });
    } catch (err) {
        console.error('Error fetching addons:', err);
        res.status(500).json({ error: 'Failed to fetch add-ons' });
    }
});

module.exports = router;