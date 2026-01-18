const express = require('express');
const router = express.Router();
const sql = require('../db');

// GET /api/calendar/bookings.ics
router.get('/bookings.ics', async (req, res) => {
    try {
        const bookings = await sql`
            SELECT b.*, c.name as customer_name, c.phone, c.address, s.name as service_name, s.duration_minutes
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            LEFT JOIN services s ON b.service_id = s.id
            WHERE b.status != 'cancelled'
            AND b.scheduled_date >= CURRENT_DATE - INTERVAL '30 days'
            ORDER BY b.scheduled_date, b.scheduled_time
        `;

        // Build iCal content
        let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Gold Rush Detailing//Bookings//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Gold Rush Detailing Bookings
X-WR-TIMEZONE:America/Chicago
`;

        for (const booking of bookings) {
            const startDate = new Date(`${booking.scheduled_date}T${booking.scheduled_time}`);
            const endDate = new Date(startDate.getTime() + (booking.duration_minutes || 60) * 60000);
            
            const formatDate = (date) => {
                return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
            };

            const location = booking.address ? booking.address.replace(/,/g, '\\,').replace(/\n/g, '\\n') : '';
            const description = `Customer: ${booking.customer_name}\\nPhone: ${booking.phone || 'N/A'}\\nVehicle: ${booking.vehicle_type || 'N/A'}\\nPrice: $${booking.total_price}${booking.notes ? '\\nNotes: ' + booking.notes : ''}`.replace(/\n/g, '\\n');

            ical += `BEGIN:VEVENT
UID:booking-${booking.id}@goldrushdetailing.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${booking.service_name} - ${booking.customer_name}
DESCRIPTION:${description}
LOCATION:${location}
STATUS:${booking.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE'}
END:VEVENT
`;
        }

        ical += 'END:VCALENDAR';

        res.set({
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': 'attachment; filename="bookings.ics"'
        });
        res.send(ical);

    } catch (err) {
        console.error('Error generating calendar:', err);
        res.status(500).json({ error: 'Failed to generate calendar' });
    }
});

module.exports = router;