const express = require('express');
const router = express.Router();
const sql = require('../db');

// GET /api/bookings (list all)
router.get('/', async (req, res) => {
    try {
        const bookings = await sql`
            SELECT b.*, c.name as customer_name, c.email, s.name as service_name
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            LEFT JOIN services s ON b.service_id = s.id
            ORDER BY b.scheduled_date, b.scheduled_time
        `;
        res.json({ bookings });
    } catch (err) {
        console.error('Error fetching bookings:', err.message);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// GET /api/bookings/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [booking] = await sql`
            SELECT b.*, c,name as customer_name, c.email, c.phone, s.name as service_name
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            LEFT JOIN services s ON b.service_id = s.id
            WHERE b.id = ${id}
        `;
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json({ booking });
    } catch (err) {
        console.error('Error fetching booking:', err.message);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
});

// POST /api/bookings (create new)
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, address, service_id, vehicle_type, scheduled_date, scheduled_time, notes } = req.body;

        // Create or find customer
        let [customer] = await sql`
            SELECT * FROM customers WHERE email = ${email}
        `;

        if (!customer) {
            [customer] = await sql`
                INSERT INTO customers (name, email, phone, address)
                VALUES (${name}, ${email}, ${phone || null}, ${address || null})
                RETURNING *
            `;
        }

        // Get service price
        const [service] =  await sql`SELECT * FROM services WHERE id = ${service_id}`;
        if (!service) {
            return res.status(400).json({ error: 'Invalid service' });
        }

        // Create booking
        const [booking] = await sql`
            INSERT INTO bookings (customer_id, service_id, vehicle_type, scheduled_date, scheduled_time, total_price, notes)
            VALUES (${customer.id}, ${service_id}, ${vehicle_type}, ${scheduled_date}, ${scheduled_time}, ${service.base_price}, ${notes || null})
            RETURNING *
        `;

        res.status(201).json({
            message: 'Booking created',
            booking,
            customer
        });
    } catch (err) {
        console.error('Error creating booking:', err.message);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// PATCH /api/bookings/:id (update status)
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const [booking] = await sql`
            UPDATE bookings
            SET status = ${status}
            WHERE id = ${id}
            RETURNING *
        `;

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json({ message: 'Booking updated', booking});
    } catch (err) {
        console.error('Error updating booking:', err.message);
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

// DELETE /api/bookings/:id
router.delete('/id', async (req, res) => {
    try {
        const { id } = req.params;

        const [booking] = await sql`
            DELETE FROM bookings WHERE id = ${id} RETURNING *
        `;

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json({ message: 'Booking cancelled', booking });
    } catch (err) {
        console.error('Error deleting booking', err.message);
        res.status(500).json({ error: 'Failed to delete booking' });
    }
});

module.exports = router;