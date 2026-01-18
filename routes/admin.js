const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// POST /api/admin/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const [admin] = await sql`
            SELECT * FROM admins WHERE username = ${username}
        `;

        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, admin.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ message: 'Login successful', token });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Login failed' });
    }
});

// GET /api/admin/stats
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const weekEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const bookings = await sql`SELECT * FROM bookings WHERE status != 'cancelled'`;
        
        const todayCount = bookings.filter(b => 
            b.scheduled_date.toISOString().split('T')[0] === today
        ).length;
        
        const pendingCount = bookings.filter(b => b.status === 'pending').length;
        
        const weekBookings = bookings.filter(b => {
            const d = b.scheduled_date.toISOString().split('T')[0];
            return d >= today && d <= weekEnd;
        });
        
        const weekRevenue = weekBookings.reduce((sum, b) => 
            sum + parseFloat(b.total_price || 0), 0
        );
        
        res.json({ todayCount, pendingCount, weekCount: weekBookings.length, weekRevenue });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;