require('dotenv').config();
const express = require('express');
const sql = require('./db');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
sql`SELECT 1`.then(() => {
    console.log('Database connected');
}).catch((err) => {
    console.error('Database connection failed:', err.message);
});

// Import routes
const servicesRoutes = require('./routes/services');
const addonsRoutes = require('./routes/addons');
const bookingsRoutes = require('./routes/bookings');
const bookingActionsRoutes = require('./routes/booking-actions');
const availabilityRoutes = require('./routes/availability');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');
const calendarRoutes = require('./routes/calendar');

// Basic health check route
app.get('/', (req, res) => {
    res.json({ message: 'Gold Rush Detailing API is running' });
});

// Mount routes
app.use('/api/services', servicesRoutes);
app.use('/api/addons', addonsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/booking-actions', bookingActionsRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/calendar', calendarRoutes);

// Start Server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});

// -----------------------------------------------------------------------------

// **Calendar subscription URLs:**

// Once deployed, the calendar can be subscribe to at:

// https://gold-rush-backend-production.up.railway.app/api/calendar/bookings.ics

// -----------------------------------------------------------------------------