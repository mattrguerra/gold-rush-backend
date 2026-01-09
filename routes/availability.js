const express = require('express');
const router = express.Router();
const sql = require('../db');

// GET /api/availbility/:date - get available slots for a date
router.get('/:date', async (req, res) => {
    try {
        const { date } = req.params;

        // Check if date is blocked
        const [availability] = await sql`
            SELECT * FROM availability WHERE date = ${date}
        `;

        if (availability?.blocked) {
            return res.json({ date, available: false, slots: [], message: 'This date is not available' });
        }

        // Get existing bookings for this date
        const bookings = await sql`
            SELECT scheduled_time, service_id, s.duration_minutes
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            WHERE scheduled_date = ${date}
            AND status != 'cancelled'
        `;

        // Define business hours (9 AM - 5 PM, hourly slots)
        const allSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

        // Filter out booked slots
        const bookedTimes = bookings.map(b => b.scheduled_time.slice(0, 5));
        const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

        res.json({
            date,
            available: availableSlots.length > 0,
            slots: availableSlots,
            booked: bookedTimes
        });
    } catch (err) {
        console.error('Error fetching availability', err.message);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }
});

// POST /api/availability - block a date or set custom hours (admin)
router.post('/', async (req, res) => {
    try {
        const { date, blocked, time_slots } = req.body;

        const [availability] = await sql`
            INSERT INFO availability (date, blocked, time_slots)
            VALUES (${date}, ${blocked || false}, time_slots = ${JSON.stringify(time_slots || [])})
            ON CONFLICT (date)
            DO UPDATE SET blocked = ${blocked || false}, time_slots = ${JSON.stringify(time_slots || [])}
            RETURNING *
        `;

        res.json({ message: 'Availability updated', availability });
    } catch (err) {
        console.error('Error setting availability:', err.message);
        res.status(500).json({ error: 'Failed to set availability' });
    }
});

module.exports = router;