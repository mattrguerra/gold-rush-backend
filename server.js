require('dotenv').config();
const express = require('express');
const sql = require('./db');
const app = express()
const port = 3000;

// Test database connection
sql`SELECT 1`.then(() => {
    console.log('Database connected');
}).catch((err) => {
    console.error('Database connection failed:', err.message);
});

// Import routes
const servicesRoutes = require('./routes/services');
const bookingsRoutes = require('./routes/bookings');
const availabilityRoutes = require('./routes/availability');
const adminRoutes = require('./routes/admin');

// Middleware to parse JSON request bodies
app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
    res.json({message: 'Gold Rush Detailing API is running' });
});

// Mount routes
app.use('/api/services', servicesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/admin', adminRoutes);

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});