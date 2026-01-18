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
            // Handle date parsing safely
            let dateStr;
            if (booking.scheduled_date instanceof Date) {
                dateStr = booking.scheduled_date.toISOString().split('T')[0];
            } else {
                dateStr = String(booking.scheduled_date).split('T')[0];
            }
            
            // Handle time - ensure it's in HH:MM format
            let timeStr = booking.scheduled_time || '09:00';
            if (timeStr.length === 5) {
                timeStr = timeStr + ':00';
            }
            
            const startDate = new Date(`${dateStr}T${timeStr}`);
            
            // Check if date is valid
            if (isNaN(startDate.getTime())) {
                console.error(`Invalid date for booking ${booking.id}: ${dateStr} ${timeStr}`);
                continue;
            }
            
            const duration = booking.duration_minutes || 60;
            const endDate = new Date(startDate.getTime() + duration * 60000);
            
            const formatDateICal = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                return `${year}${month}${day}T${hours}${minutes}${seconds}`;
            };

            const escapeText = (text) => {
                if (!text) return '';
                return text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
            };

            const location = escapeText(booking.address);
            const description = escapeText(`Customer: ${booking.customer_name}\nPhone: ${booking.phone || 'N/A'}\nVehicle: ${booking.vehicle_type || 'N/A'}\nPrice: $${booking.total_price}${booking.notes ? '\nNotes: ' + booking.notes : ''}`);

            ical += `BEGIN:VEVENT
UID:booking-${booking.id}@goldrushdetailing.com
DTSTAMP:${formatDateICal(new Date())}
DTSTART:${formatDateICal(startDate)}
DTEND:${formatDateICal(endDate)}
SUMMARY:${escapeText(booking.service_name)} - ${escapeText(booking.customer_name)}
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
        res.status(500).send('Failed to generate calendar');
    }
});

module.exports = router;