const express = require('express');
const router = express.Router();
const sql = require('../db');

// GET /api/booking-actions/confirm/:id/:token
router.get('/confirm/:id/:token', async (req, res) => {
    try {
        const { id, token } = req.params;
        
        // Simple token validation (booking id + secret)
        const expectedToken = Buffer.from(`${id}-${process.env.ACTION_SECRET || 'goldrushadmin'}`).toString('base64');
        
        if (token !== expectedToken) {
            return res.status(403).send(errorPage('Invalid or expired link'));
        }

        const [booking] = await sql`
            UPDATE bookings 
            SET status = 'confirmed' 
            WHERE id = ${id} 
            RETURNING *
        `;

        if (!booking) {
            return res.status(404).send(errorPage('Booking not found'));
        }

        res.send(successPage('Booking Confirmed!', `Booking #${id} has been confirmed.`));
    } catch (err) {
        console.error('Error confirming booking:', err);
        res.status(500).send(errorPage('Failed to confirm booking'));
    }
});

// GET /api/booking-actions/cancel/:id/:token
router.get('/cancel/:id/:token', async (req, res) => {
    try {
        const { id, token } = req.params;
        
        const expectedToken = Buffer.from(`${id}-${process.env.ACTION_SECRET || 'goldrushadmin'}`).toString('base64');
        
        if (token !== expectedToken) {
            return res.status(403).send(errorPage('Invalid or expired link'));
        }

        const [booking] = await sql`
            UPDATE bookings 
            SET status = 'cancelled' 
            WHERE id = ${id} 
            RETURNING *
        `;

        if (!booking) {
            return res.status(404).send(errorPage('Booking not found'));
        }

        res.send(successPage('Booking Cancelled', `Booking #${id} has been cancelled.`));
    } catch (err) {
        console.error('Error cancelling booking:', err);
        res.status(500).send(errorPage('Failed to cancel booking'));
    }
});

function successPage(title, message) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${title} - Gold Rush Detailing</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
            .container { text-align: center; padding: 40px; }
            .icon { font-size: 60px; margin-bottom: 20px; }
            h1 { color: #d4af37; margin-bottom: 15px; }
            p { color: #999; font-size: 18px; }
            a { display: inline-block; margin-top: 30px; background: #d4af37; color: #0a0a0a; padding: 15px 30px; text-decoration: none; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">✓</div>
            <h1>${title}</h1>
            <p>${message}</p>
            <a href="https://goldrushdetailing.com/admin.html">Go to Dashboard</a>
        </div>
    </body>
    </html>
    `;
}

function errorPage(message) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Error - Gold Rush Detailing</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
            .container { text-align: center; padding: 40px; }
            .icon { font-size: 60px; margin-bottom: 20px; }
            h1 { color: #ef4444; margin-bottom: 15px; }
            p { color: #999; font-size: 18px; }
            a { display: inline-block; margin-top: 30px; background: #d4af37; color: #0a0a0a; padding: 15px 30px; text-decoration: none; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">✕</div>
            <h1>Error</h1>
            <p>${message}</p>
            <a href="https://goldrushdetailing.com/admin.html">Go to Dashboard</a>
        </div>
    </body>
    </html>
    `;
}

module.exports = router;