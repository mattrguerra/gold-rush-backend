const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /api/addons
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('addons')
            .select('*')
            .eq('active', true)
            .order('sort_order', { ascending: true });

        if (error) throw error;

        res.json({ addons: data });
    } catch (err) {
        console.error('Error fetching addons:', err);
        res.status(500).json({ error: 'Failed to fetch add-ons' });
    }
});

module.exports = router;